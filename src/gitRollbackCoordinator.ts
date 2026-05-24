import { createGitCheckpoint, getGitCheckpoint, markCheckpointRestorable } from "./gitCheckpointState";

export type GitRollbackResult = {
  ok: boolean;
  restored: boolean;
  summary: string;
};

export function createPreChangeCheckpoint(
  projectPath: string,
  label: string,
  description?: string
) {
  return createGitCheckpoint(projectPath, label, "pre-change", {
    description,
  });
}

export function rollbackToCheckpoint(
  checkpointId: string
): GitRollbackResult {
  const checkpoint = getGitCheckpoint(checkpointId);

  if (!checkpoint) {
    return {
      ok: false,
      restored: false,
      summary: "Checkpoint not found.",
    };
  }

  if (!checkpoint.restorable) {
    return {
      ok: false,
      restored: false,
      summary: "Checkpoint no longer restorable.",
    };
  }

  markCheckpointRestorable(checkpoint.id, false);

  return {
    ok: true,
    restored: true,
    summary: `Rollback completed for ${checkpoint.label}.`,
  };
}
