import { finalizeExecutionDecision } from './verificationDecisionEngine';
import { notifyExecutionResult } from './notificationExecutionBridge';

export function finalizeVerifiedExecution(
  success: boolean,
  repairAttempted: boolean,
  changedFiles: number,
) {
  const confidence = finalizeExecutionDecision(
    success,
    repairAttempted,
    changedFiles,
  );

  notifyExecutionResult();

  return confidence;
}
