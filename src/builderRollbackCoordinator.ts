import { createGitCheckpoint } from "./gitCheckpointManager";
import { createBuilderEscalation } from "./builderFailureEscalation";

export type BuilderRollbackDecision = {
  shouldRollback: boolean;
  reason: string;
  escalationCreated: boolean;
};

export function evaluateBuilderRollback(
  projectPath: string,
  task: string,
  verificationPassed: boolean,
  repeatedFailure: boolean
): BuilderRollbackDecision {
  if (verificationPassed) {
    return {
      shouldRollback: false,
      reason: "Verification passed.",
      escalationCreated: false,
    };
  }

  const checkpoint = createGitCheckpoint(
    projectPath,
    `Rollback checkpoint: ${task.slice(0, 60)}`,
    []
  );

  const escalation = createBuilderEscalation(
    projectPath,
    task,
    repeatedFailure
      ? "Repeated failed repair attempts triggered rollback protection."
      : "Verification failed and rollback was recommended.",
    repeatedFailure ? "critical" : "high"
  );

  return {
    shouldRollback: true,
    reason: `Rollback recommended. Checkpoint: ${checkpoint.id}`,
    escalationCreated: Boolean(escalation),
  };
}
