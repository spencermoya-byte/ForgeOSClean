import { createVerifiedFixSession, updateVerificationCriterion } from "./verifiedFixCriteria";
import { applyAndVerifyEdit, checkpointVerifiedEdit, prepareVerifiedEdit, type VerifiedEditState } from "./vivusExecutionLoop";

export type VerifiedWorkflowResult = {
  ok: boolean;
  reason?: string;
  state?: VerifiedEditState;
  sessionId?: string;
};

export async function runVerifiedWorkflow(projectPath: string, task: string): Promise<VerifiedWorkflowResult> {
  const session = createVerifiedFixSession(projectPath, task);
  const planSummary = `Verified task: ${task}\n\nProject path: ${projectPath}\n\nAcceptance criteria:\n- requested behavior is satisfied\n- build or verification passes\n- unrelated behavior is preserved`;

  const prepared = await prepareVerifiedEdit({ projectPath, planSummary });
  if (prepared.stage !== "diff-ready" || !prepared.proposal?.changed) {
    return { ok: false, reason: prepared.message, state: prepared, sessionId: session.id };
  }

  const checkpointed = await checkpointVerifiedEdit(prepared);
  if (checkpointed.stage !== "checkpoint-ready") {
    return { ok: false, reason: checkpointed.message, state: checkpointed, sessionId: session.id };
  }

  const result = await applyAndVerifyEdit(checkpointed, planSummary);
  const passed = result.stage === "verified" || result.stage === "repaired";

  updateVerificationCriterion(session.id, "build-pass", passed);
  updateVerificationCriterion(session.id, "target-goal", passed);
  updateVerificationCriterion(session.id, "no-regression", passed);

  return { ok: passed, reason: passed ? undefined : result.message, state: result, sessionId: session.id };
}
