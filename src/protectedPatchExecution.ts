import { checkBuilderExecutionAllowed, resolveBuilderExecutionPath } from "./builderExecutionGuard";
import { assertCanReadFilesystemPath, assertCanWriteFilesystemPath } from "./protectedFilesystemGuard";
import { checkSearchIndexAccessAllowed } from "./searchIndexProtectionGuard";
import { checkTerminalExecutionAllowed } from "./terminalExecutionSandbox";

export type ProtectedPatchRequest = {
  projectPath?: string;
  relativePath: string;
  originalContent: string;
  nextContent: string;
  reason: string;
};

export type ProtectedPatchVerification = {
  ok: boolean;
  commandId: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  blockedReason: string | null;
};

export type ProtectedPatchRollback = {
  attempted: boolean;
  ok: boolean;
  checkpointId: string | null;
  restoredFiles: string[];
  blockedReason: string | null;
};

export type ProtectedPatchResult = {
  ok: boolean;
  projectPath: string;
  relativePath: string;
  changed: boolean;
  diff: string;
  checkpointId: string | null;
  verification: ProtectedPatchVerification | null;
  rollback: ProtectedPatchRollback | null;
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

type BackendSafeCommandResponse = {
  ok?: boolean;
  commandId?: string;
  exitCode?: number | null;
  stdout?: string;
  stderr?: string;
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
    verification: null,
    rollback: null,
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

async function restoreProtectedPatchCheckpoint(projectPath: string, checkpointId: string): Promise<ProtectedPatchRollback> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<BackendCheckpointResponse>("vivus_restore_patch_checkpoint", {
      request: {
        projectPath,
        checkpointId,
      },
    });

    return {
      attempted: true,
      ok: Boolean(result?.ok),
      checkpointId,
      restoredFiles: result?.files ?? [],
      blockedReason: result?.blockedReason ?? null,
    };
  } catch (error) {
    return {
      attempted: true,
      ok: false,
      checkpointId,
      restoredFiles: [],
      blockedReason: error instanceof Error ? error.message : "Rollback failed.",
    };
  }
}

async function verifyProtectedPatchBuild(projectPath: string): Promise<ProtectedPatchVerification> {
  const terminalDecision = checkTerminalExecutionAllowed({ cwd: projectPath, commandId: "npm_build" });

  if (!terminalDecision.allowed) {
    return {
      ok: false,
      commandId: "npm_build",
      exitCode: null,
      stdout: "",
      stderr: "",
      blockedReason: terminalDecision.reason ?? "Build verification blocked by terminal sandbox.",
    };
  }

  const { invoke } = await import("@tauri-apps/api/core");
  const result = await invoke<BackendSafeCommandResponse>("vivus_run_safe_command", {
    request: {
      projectPath,
      commandId: "npm_build",
    },
  });

  return {
    ok: Boolean(result?.ok),
    commandId: result?.commandId ?? "npm_build",
    exitCode: typeof result?.exitCode === "number" ? result.exitCode : null,
    stdout: result?.stdout ?? "",
    stderr: result?.stderr ?? "",
    blockedReason: result?.blockedReason ?? null,
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
      checkpointId: null,
      verification: null,
      rollback: null,
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

    if (!result?.ok) {
      const rollback = await restoreProtectedPatchCheckpoint(guard.projectPath, checkpoint.checkpointId);
      return {
        ok: false,
        projectPath: guard.projectPath,
        relativePath: result?.relativePath ?? request.relativePath,
        changed: false,
        diff:
          result?.diffPreview ??
          makeSimpleDiff(request.relativePath, request.originalContent, request.nextContent),
        checkpointId: checkpoint.checkpointId,
        verification: null,
        rollback,
        blockedReason: result?.blockedReason ?? "Protected patch backend rejected the write.",
      };
    }

    const verification = await verifyProtectedPatchBuild(guard.projectPath);

    if (!verification.ok) {
      const rollback = await restoreProtectedPatchCheckpoint(guard.projectPath, checkpoint.checkpointId);
      return {
        ok: false,
        projectPath: guard.projectPath,
        relativePath: result.relativePath ?? request.relativePath,
        changed: false,
        diff:
          result.diffPreview ??
          makeSimpleDiff(request.relativePath, request.originalContent, request.nextContent),
        checkpointId: checkpoint.checkpointId,
        verification,
        rollback,
        blockedReason:
          verification.blockedReason ??
          (rollback.ok ? "Build verification failed after patch. Changes were rolled back." : "Build verification failed after patch. Rollback failed."),
      };
    }

    return {
      ok: true,
      projectPath: guard.projectPath,
      relativePath: result.relativePath ?? request.relativePath,
      changed: Boolean(result.changed),
      diff:
        result.diffPreview ??
        makeSimpleDiff(request.relativePath, request.originalContent, request.nextContent),
      checkpointId: checkpoint.checkpointId,
      verification,
      rollback: null,
      blockedReason: null,
    };
  } catch (error) {
    return blockedPatchResult(
      guard.projectPath,
      request.relativePath,
      error instanceof Error ? error.message : "Protected patch execution bridge failed.",
    );
  }
}
