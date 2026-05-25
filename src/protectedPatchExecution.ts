import { checkBuilderExecutionAllowed, resolveBuilderExecutionPath } from "./builderExecutionGuard";
import { assertCanReadFilesystemPath, assertCanWriteFilesystemPath } from "./protectedFilesystemGuard";
import { checkSearchIndexAccessAllowed } from "./searchIndexProtectionGuard";

export type ProtectedPatchRequest = {
  projectPath?: string;
  relativePath: string;
  originalContent: string;
  nextContent: string;
  reason: string;
};

export type ProtectedPatchResult = {
  ok: boolean;
  projectPath: string;
  relativePath: string;
  changed: boolean;
  diff: string;
  checkpointId: string | null;
  blockedReason: string | null;
};

type BackendPatchResponse = {
  ok?: boolean;
  relativePath?: string;
  changed?: boolean;
  diffPreview?: string;
  blockedReason?: string | null;
};

type BackendCheckpointResponse = {
  ok?: boolean;
  checkpointId?: string | null;
  files?: string[];
  blockedReason?: string | null;
};

function hasTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function joinProjectPath(projectPath: string, relativePath: string) {
  return `${projectPath.replace(/\\+/g, "/").replace(/\/+$/, "")}/${relativePath.replace(/^\/+/, "")}`;
}

function makeSimpleDiff(relativePath: string, originalContent: string, nextContent: string) {
  if (originalContent === nextContent) return "";

  const beforeLines = originalContent.split("\n");
  const afterLines = nextContent.split("\n");
  const maxLines = Math.max(beforeLines.length, afterLines.length);
  const lines = [`--- ${relativePath}`, `+++ ${relativePath}`];

  for (let index = 0; index < maxLines; index += 1) {
    const before = beforeLines[index];
    const after = afterLines[index];

    if (before === after) continue;
    if (typeof before === "string") lines.push(`- ${before}`);
    if (typeof after === "string") lines.push(`+ ${after}`);
  }

  return lines.join("\n");
}

function blockedPatchResult(projectPath: string, relativePath: string, reason: string): ProtectedPatchResult {
  return {
    ok: false,
    projectPath,
    relativePath,
    changed: false,
    diff: "",
    checkpointId: null,
    blockedReason: reason,
  };
}

export function checkProtectedPatchAllowed(request: ProtectedPatchRequest) {
  const projectPath = resolveBuilderExecutionPath(request.projectPath);

  const builderDecision = checkBuilderExecutionAllowed(projectPath);
  if (!builderDecision.allowed) {
    return {
      allowed: false,
      projectPath,
      reason: builderDecision.reason ?? "Patch execution blocked by Builder execution guard.",
    };
  }

  const searchDecision = checkSearchIndexAccessAllowed(projectPath, "context");
  if (!searchDecision.allowed) {
    return {
      allowed: false,
      projectPath,
      reason: searchDecision.reason ?? "Patch execution blocked by search/index guard.",
    };
  }

  const absoluteTarget = joinProjectPath(projectPath, request.relativePath);

  try {
    assertCanReadFilesystemPath(absoluteTarget);
    assertCanWriteFilesystemPath(absoluteTarget);
  } catch (error) {
    return {
      allowed: false,
      projectPath,
      reason: error instanceof Error ? error.message : "Patch execution blocked by filesystem guard.",
    };
  }

  return {
    allowed: true,
    projectPath,
    reason: undefined,
  };
}

async function createProtectedPatchCheckpoint(projectPath: string, relativePath: string) {
  const { invoke } = await import("@tauri-apps/api/core");

  return invoke<BackendCheckpointResponse>("vivus_create_patch_checkpoint", {
    request: {
      projectPath,
      files: [relativePath],
    },
  });
}

export async function runProtectedPatchExecution(request: ProtectedPatchRequest): Promise<ProtectedPatchResult> {
  const guard = checkProtectedPatchAllowed(request);

  if (!guard.allowed) {
    return blockedPatchResult(guard.projectPath, request.relativePath, guard.reason ?? "Patch execution blocked.");
  }

  if (request.originalContent === request.nextContent) {
    return {
      ok: true,
      projectPath: guard.projectPath,
      relativePath: request.relativePath,
      changed: false,
      diff: "",
      checkpointId: null,
      blockedReason: null,
    };
  }

  if (!hasTauriRuntime()) {
    return blockedPatchResult(
      guard.projectPath,
      request.relativePath,
      "Protected patch execution requires the Tauri desktop runtime.",
    );
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const checkpoint = await createProtectedPatchCheckpoint(guard.projectPath, request.relativePath);

    if (!checkpoint?.ok || !checkpoint.checkpointId) {
      return blockedPatchResult(
        guard.projectPath,
        request.relativePath,
        checkpoint?.blockedReason ?? "Unable to create checkpoint before patch.",
      );
    }

    const result = await invoke<BackendPatchResponse>("vivus_apply_approved_file_patch", {
      request: {
        projectPath: guard.projectPath,
        relativePath: request.relativePath,
        expectedCurrentContent: request.originalContent,
        nextContent: request.nextContent,
        approvalToken: "APPROVE_PATCH",
      },
    });

    return {
      ok: Boolean(result?.ok),
      projectPath: guard.projectPath,
      relativePath: result?.relativePath ?? request.relativePath,
      changed: Boolean(result?.changed),
      diff:
        result?.diffPreview ??
        makeSimpleDiff(request.relativePath, request.originalContent, request.nextContent),
      checkpointId: checkpoint.checkpointId,
      blockedReason: result?.blockedReason ?? null,
    };
  } catch (error) {
    return blockedPatchResult(
      guard.projectPath,
      request.relativePath,
      error instanceof Error ? error.message : "Protected patch execution bridge failed.",
    );
  }
}
