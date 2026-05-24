import { calculatePatchConfidence } from './patchConfidence';

export function deriveExecutionConfidence(
  verificationPassed: boolean,
  repairAttempted: boolean,
  changedFiles: number,
) {
  const signals = [];

  signals.push({
    reason: 'verification',
    weight: verificationPassed ? 1 : 0.1,
  });

  signals.push({
    reason: 'repair',
    weight: repairAttempted ? 0.7 : 1,
  });

  signals.push({
    reason: 'scope',
    weight:
      changedFiles <= 2
        ? 1
        : changedFiles <= 5
          ? 0.8
          : 0.6,
  });

  return calculatePatchConfidence(signals);
}
