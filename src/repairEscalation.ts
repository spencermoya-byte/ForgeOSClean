export type RepairAttempt = {
  attempt: number;
  success: boolean;
  summary: string;
};

export type RepairEscalationResult = {
  escalate: boolean;
  reason: string;
};

const MAX_AUTO_REPAIR_ATTEMPTS = 2;

export function shouldEscalateRepair(
  attempts: RepairAttempt[],
): RepairEscalationResult {
  const failures = attempts.filter((a) => !a.success);

  if (failures.length >= MAX_AUTO_REPAIR_ATTEMPTS) {
    return {
      escalate: true,
      reason: 'Maximum repair attempts reached.',
    };
  }

  return {
    escalate: false,
    reason: 'Continue automated repair.',
  };
}
