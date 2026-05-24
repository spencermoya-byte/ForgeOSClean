import { runBuilderRepairWorkflow } from "./builderRepairWorkflow";
import { updateBuilderVerificationPanel } from "./builderVerificationPanelState";

export type BuilderBridgeResult = {
  ok: boolean;
  blocked: boolean;
  escalationRequired: boolean;
  summary: string;
};

export function finalizeBuilderExecution(
  sessionId: string,
  projectPath: string,
  task: string,
  verificationPassed: boolean,
  verificationDetail: string,
  repeatedFailure = false
): BuilderBridgeResult {
  const result = runBuilderRepairWorkflow(
    sessionId,
    projectPath,
    task,
    verificationPassed,
    verificationDetail,
    repeatedFailure
  );

  updateBuilderVerificationPanel(projectPath, {
    isVisible: true,
    sessionId,
    status: result.ok
      ? "passed"
      : result.requiresRollback
        ? "blocked"
        : "failed",
    title: result.ok ? "Verified Fixed" : "Verification Failed",
    message: result.summary,
  });

  return {
    ok: result.ok,
    blocked: result.requiresRollback,
    escalationRequired: result.escalationRequired,
    summary: result.summary,
  };
}
