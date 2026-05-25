import { runProtectedPatchExecution, type ProtectedPatchResult } from "./protectedPatchExecution";

export type BuilderPatchResponse = {
  ok: boolean;
  relativePath: string;
  changed: boolean;
  diffPreview: string;
  blockedReason?: string | null;
  protectedResult?: ProtectedPatchResult | null;
};

export type BuilderCheckpointResponse = {
  ok: boolean;
  checkpointId?: string | null;
  files: string[];
  blockedReason?: string | null;
};

export type ProjectTreeEntry = {
  name: string;
  relativePath: string;
  entryType: "file" | "directory" | string;
  sizeBytes?: number | null;
};

export type ProjectTreeResponse = {
  ok: boolean;
  projectPath: string;
  relativePath: string;
  entries: ProjectTreeEntry[];
  blockedReason?: string | null;
};

export type FileInspectionResponse = {
  ok: boolean;
  projectPath: string;
  relativePath: string;
  sizeBytes?: number | null;
  content: string;
  truncated: boolean;
  blockedReason?: string | null;
};

const fallbackProjectPath = ".";

async function invokeOrFallback<T>(command: string, args: Record<string, unknown>, fallback: T): Promise<T> {
  const hasTauriRuntime = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

  if (!hasTauriRuntime) {
    return fallback;
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(command, args);
  } catch (error) {
    console.warn(`Vivus builder patch command failed: ${command}`, error);
    return fallback;
  }
}

export async function listProjectTree(projectPath = fallbackProjectPath, relativePath = ""): Promise<ProjectTreeResponse> {
  return invokeOrFallback<ProjectTreeResponse>(
    "vivus_list_project_tree",
    { request: { projectPath, relativePath } },
    {
      ok: false,
      projectPath,
      relativePath,
      entries: [],
      blockedReason: "Project tree inspection requires the Tauri runtime.",
    },
  );
}

export async function readProjectFile(projectPath: string, relativePath: string): Promise<FileInspectionResponse> {
  return invokeOrFallback<FileInspectionResponse>(
    "vivus_read_project_file",
    { request: { projectPath, relativePath } },
    {
      ok: false,
      projectPath,
      relativePath,
      content: "",
      truncated: false,
      blockedReason: "File inspection requires the Tauri runtime.",
    },
  );
}

export async function previewFilePatch(projectPath: string, relativePath: string, nextContent: string): Promise<BuilderPatchResponse> {
  return invokeOrFallback<BuilderPatchResponse>(
    "vivus_preview_file_patch",
    { request: { projectPath, relativePath, nextContent } },
    {
      ok: false,
      relativePath,
      changed: false,
      diffPreview: "",
      blockedReason: "Patch preview requires the Tauri runtime.",
      protectedResult: null,
    },
  );
}

export async function createPatchCheckpoint(projectPath: string, files: string[]): Promise<BuilderCheckpointResponse> {
  return invokeOrFallback<BuilderCheckpointResponse>(
    "vivus_create_patch_checkpoint",
    { request: { projectPath, files } },
    {
      ok: false,
      checkpointId: null,
      files: [],
      blockedReason: "Checkpoint creation requires the Tauri runtime.",
    },
  );
}

export async function applyApprovedFilePatch(
  projectPath: string,
  relativePath: string,
  expectedCurrentContent: string,
  nextContent: string,
  approvalToken: "APPROVE_PATCH",
): Promise<BuilderPatchResponse> {
  if (approvalToken !== "APPROVE_PATCH") {
    return {
      ok: false,
      relativePath,
      changed: false,
      diffPreview: "",
      blockedReason: "Patch application requires explicit approval.",
      protectedResult: null,
    };
  }

  const protectedResult = await runProtectedPatchExecution({
    projectPath,
    relativePath,
    originalContent: expectedCurrentContent,
    nextContent,
    reason: "Verified edit loop approved patch",
  });

  return {
    ok: protectedResult.ok,
    relativePath: protectedResult.relativePath,
    changed: protectedResult.changed,
    diffPreview: protectedResult.diff,
    blockedReason:
      protectedResult.blockedReason ??
      (protectedResult.verifiedFixed?.verified ? null : protectedResult.verifiedFixed?.message ?? null),
    protectedResult,
  };
}

export async function restorePatchCheckpoint(projectPath: string, checkpointId: string): Promise<BuilderCheckpointResponse> {
  return invokeOrFallback<BuilderCheckpointResponse>(
    "vivus_restore_patch_checkpoint",
    { request: { projectPath, checkpointId } },
    {
      ok: false,
      checkpointId,
      files: [],
      blockedReason: "Checkpoint restore requires the Tauri runtime.",
    },
  );
}
