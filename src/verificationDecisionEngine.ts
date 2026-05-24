import { deriveExecutionConfidence } from './executionConfidenceBridge';
import { updateVerifiedFixStatus } from './verifiedFixStatus';

export function finalizeExecutionDecision(
  verificationPassed: boolean,
  repairAttempted: boolean,
  changedFiles: number,
) {
  const confidence = deriveExecutionConfidence(
    verificationPassed,
    repairAttempted,
    changedFiles,
  );

  updateVerifiedFixStatus({
    state: verificationPassed
      ? 'verified'
      : 'failed',
    confidence,
    summary: verificationPassed
      ? 'Verified fix passed.'
      : 'Verification failed.',
    timestamp: Date.now(),
  });

  return confidence;
}
