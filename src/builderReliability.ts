import { getBuilderLoopRisk, resetBuilderAttempts } from "./builderLoopProtection";
import {
  blockVerifiedFixSession,
  completeVerifiedFixSession,
  updateVerificationCriterion,
} from "./verifiedFixCriteria";

export type BuilderReliabilityResult = {
  ok: boolean;
  summary: string;
  escalationRequired: boolean;
};

export function resolveBuilderVerification(
  sessionId: string,
  projectPath: string,
  task: string,
  passed: boolean,
  detail: string
): BuilderReliabilityResult {
  const loopRisk = getBuilderLoopRisk(projectPath, task);

  updateVerificationCriterion(sessionId, "target-goal", passed, {
    evidence: passed ? detail : undefined,
    note: passed ? "Requested behavior validated." : "Behavior could not be confirmed.",
  });

  updateVerificationCriterion(sessionId, "build-pass", passed, {
    evidence: passed ? "Verification pipeline passed." : undefined,
    note: passed ? "Build and verification succeeded." : "Verification failed.",
  });

  updateVerificationCriterion(sessionId, "no-regression", passed, {
    evidence: passed ? "No immediate regression detected." : undefined,
    note: passed ? "Regression checks passed." : "Regression confidence too low.",
  });

  if (passed) {
    completeVerifiedFixSession(
      sessionId,
      true,
      "Patch verified successfully."
    );

    resetBuilderAttempts(projectPath, task);

    return {
      ok: true,
      summary: "Verified fixed",
      escalationRequired: false,
    };
  }

  const escalationRequired = loopRisk.remainingAttempts <= 1;

  blockVerifiedFixSession(
    sessionId,
    escalationRequired
      ? "Builder reliability guard blocked repeated failed fixes."
      : "Verification failed and requires another repair attempt."
  );

  return {
    ok: false,
    summary: escalationRequired
      ? "Escalation required"
      : "Repair required",
    escalationRequired,
  };
}
