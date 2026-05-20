import { inspectBuilderFile } from "./builderExecution";

export type BuilderPatchResponse = {
  ok: boolean;
  relativePath: string;
  changed: boolean;
  diffPreview: string;
  blockedReason: string | null;
};

export type BuilderCheckpointResponse = {
  ok: boolean;
  checkpointId: string | null;
  files: string[];
  blockedReason: string | null;
};

type TauriPatchResponse = Partial<BuilderPatchResponse>;
type TauriCheckpointResponse = Partial<BuilderCheckpointResponse>;

function hasTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function normalizePatchResponse(result: TauriPatchResponse | null | undefined): BuilderPatchResponse {
  return {
    ok: Boolean(result?.ok),
    relativePath: result?.relativePath ?? "",
    changed: Boolean(result?.changed),
    diffPreview: result?.diffPreview ?? "",
    blockedReason: result?.blockedReason ?? null,
  };
}

function normalizeCheckpointResponse(result: TauriCheckpointResponse | null | undefined): BuilderCheckpointResponse {
  return {
    ok: Boolean(result?.ok),
    checkpointId: result?.checkpointId ?? null,
    files: Array.isArray(result?.files) ? result.files : [],
    blockedReason: result?.blockedReason ?? null,
  };
}

export async function previewBuilderFilePatch(relativePath: string, nextContent: string, projectPath = "."): Promise<BuilderPatchResponse> {
  if (!hasTauriRuntime()) {
    return normalizePatchResponse({
      ok: false,
      relativePath,
      blockedReason: "Patch preview requires the Tauri desktop runtime.",
    });
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriPatchResponse>("vivus_preview_file_patch", {
      request: {
        projectPath,
        relativePath,
        nextContent,
      },
    });
    return normalizePatchResponse(result);
  } catch (error) {
    return normalizePatchResponse({
      ok: false,
      relativePath,
      blockedReason: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function createBuilderPatchCheckpoint(files: string[], projectPath = "."): Promise<BuilderCheckpointResponse> {
  if (!hasTauriRuntime()) {
    return normalizeCheckpointResponse({
      ok: false,
      blockedReason: "Checkpoint creation requires the Tauri desktop runtime.",
    });
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriCheckpointResponse>("vivus_create_patch_checkpoint", {
      request: {
        projectPath,
        files,
      },
    });
    return normalizeCheckpointResponse(result);
  } catch (error) {
    return normalizeCheckpointResponse({
      ok: false,
      blockedReason: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function applyApprovedBuilderPatch(
  relativePath: string,
  expectedCurrentContent: string,
  nextContent: string,
  projectPath = "."
): Promise<BuilderPatchResponse> {
  if (!hasTauriRuntime()) {
    return normalizePatchResponse({
      ok: false,
      relativePath,
      blockedReason: "Patch application requires the Tauri desktop runtime.",
    });
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriPatchResponse>("vivus_apply_approved_file_patch", {
      request: {
        projectPath,
        relativePath,
        expectedCurrentContent,
        nextContent,
        approvalToken: "APPROVE_PATCH",
      },
    });
    return normalizePatchResponse(result);
  } catch (error) {
    return normalizePatchResponse({
      ok: false,
      relativePath,
      blockedReason: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function restoreBuilderPatchCheckpoint(checkpointId: string, projectPath = "."): Promise<BuilderCheckpointResponse> {
  if (!hasTauriRuntime()) {
    return normalizeCheckpointResponse({
      ok: false,
      checkpointId,
      blockedReason: "Checkpoint restore requires the Tauri desktop runtime.",
    });
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriCheckpointResponse>("vivus_restore_patch_checkpoint", {
      request: {
        projectPath,
        checkpointId,
      },
    });
    return normalizeCheckpointResponse(result);
  } catch (error) {
    return normalizeCheckpointResponse({
      ok: false,
      checkpointId,
      blockedReason: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function readPatchBaseContent(relativePath: string, projectPath = ".") {
  const inspection = await inspectBuilderFile(relativePath, projectPath);
  return inspection.ok ? inspection.content : null;
}
