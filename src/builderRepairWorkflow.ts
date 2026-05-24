import { evaluateBuilderRollback } from "./builderRollbackCoordinator";
import { resolveBuilderVerification } from "./builderReliability";
import { updateBuilderVerificationVisibility } from "./builderVerificationVisibility";

export type BuilderRepairResult = {
  ok: boolean;
  requiresRollback: boolean;
  escalationRequired: boolean;
  summary: string;
};

export function runBuilderRepairWorkflow(
  sessionId: string,
  projectPath: string,
  task: string,
  verificationPassed: boolean,
  verificationDetail: string,
  repeatedFailure = false
): BuilderRepairResult {
  updateBuilderVerificationVisibility(projectPath, {
    currentSessionId: sessionId,
    status: "running",
    summary: "Verification in progress",
  });

  const reliability = resolveBuilderVerification(
    sessionId,
    projectPath,
    task,
    verificationPassed,
    verificationDetail
  );

  const rollback = evaluateBuilderRollback(
    projectPath,
    task,
    verificationPassed,
    repeatedFailure
  );

  const status = reliability.ok
    ? "passed"
    : rollback.shouldRollback
      ? "blocked"
      : "failed";

  updateBuilderVerificationVisibility(projectPath, {
    currentSessionId: sessionId,
    status,
    summary: reliability.summary,
  });

  return {
    ok: reliability.ok,
    requiresRollback: rollback.shouldRollback,
    escalationRequired: reliability.escalationRequired,
    summary: reliability.summary,
  };
}
