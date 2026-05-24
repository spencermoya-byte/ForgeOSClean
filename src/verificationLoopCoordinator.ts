import { shouldEscalateRepair } from './repairEscalation';
import { updateVerifiedFixStatus } from './verifiedFixStatus';

export async function finalizeVerification(success: boolean, attempts = 0) {
  const escalation = shouldEscalateRepair(
    Array.from({ length: attempts }).map((_, i) => ({
      attempt: i + 1,
      success,
      summary: success ? 'Success' : 'Failed',
    })),
  );

  updateVerifiedFixStatus({
    state: success ? 'verified' : 'failed',
    confidence: success ? 0.95 : 0.2,
    summary: escalation.reason,
    timestamp: Date.now(),
  });

  return escalation;
}
