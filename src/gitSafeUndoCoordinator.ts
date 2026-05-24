import { getGitCheckpoint } from "./gitCheckpointState";
import { rollbackToCheckpoint } from "./gitRollbackCoordinator";
import { addGitTimelineEvent } from "./gitTimelineState";

export type GitSafeUndoResult = {
  ok: boolean;
  restored: boolean;
  summary: string;
};

export function safeUndoLastCheckpoint(
  projectPath: string,
  checkpointId: string
): GitSafeUndoResult {
  const checkpoint = getGitCheckpoint(checkpointId);

  if (!checkpoint) {
    return {
      ok: false,
      restored: false,
      summary: "Undo failed: checkpoint missing.",
    };
  }

  const rollback = rollbackToCheckpoint(checkpointId);

  addGitTimelineEvent(
    projectPath,
    rollback.ok ? "rollback" : "recovery",
    rollback.ok ? "Safe undo completed" : "Safe undo failed",
    {
      relatedCheckpointId: checkpoint.id,
      description: rollback.summary,
    }
  );

  return {
    ok: rollback.ok,
    restored: rollback.restored,
    summary: rollback.summary,
  };
}
