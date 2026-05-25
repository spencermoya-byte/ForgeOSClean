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
  blockedReason: string | null;
};

type TauriPatchResult = Partial<ProtectedPatchResult>;

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
    blockedReason: reason,
  };
}

function normalizePatchResult(
  request: ProtectedPatchRequest,
  projectPath: string,
  result: TauriPatchResult | null | undefined,
): ProtectedPatchResult {
  const changed = Boolean(result?.changed ?? request.originalContent !== request.nextContent);

  return {
    ok: Boolean(result?.ok),
    projectPath: result?.projectPath ?? projectPath,
    relativePath: result?.relativePath ?? request.relativePath,
    changed,
    diff: result?.diff ?? makeSimpleDiff(request.relativePath, request.originalContent, request.nextContent),
    blockedReason: result?.blockedReason ?? null,
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
      blockedReason: null,
    };
  }

  if (!hasTauriRuntime()) {
    return {
      ok: false,
      projectPath: guard.projectPath,
      relativePath: request.relativePath,
      changed: false,
      diff: makeSimpleDiff(request.relativePath, request.originalContent, request.nextContent),
      blockedReason: "Protected patch execution requires the Tauri desktop runtime.",
    };
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriPatchResult>("vivus_apply_protected_patch", {
      request: {
        projectPath: guard.projectPath,
        relativePath: request.relativePath,
        originalContent: request.originalContent,
        nextContent: request.nextContent,
        reason: request.reason,
      },
    });

    return normalizePatchResult(request, guard.projectPath, result);
  } catch (error) {
    return blockedPatchResult(
      guard.projectPath,
      request.relativePath,
      error instanceof Error ? error.message : "Protected patch execution bridge failed.",
    );
  }
}
