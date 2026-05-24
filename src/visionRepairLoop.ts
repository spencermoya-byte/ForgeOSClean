import { runVisionVerification } from './visionVerification';

export type VisionRepairDecision = {
  shouldRepair: boolean;
  reason: string;
};

export async function evaluateVisionRepair(
  uiDescription: string,
): Promise<VisionRepairDecision> {
  const result = await runVisionVerification(uiDescription);

  if (!result.ok) {
    return {
      shouldRepair: false,
      reason: 'Vision verification unavailable.',
    };
  }

  const severeIssues = result.issues.filter(
    (issue) => issue.severity === 'high',
  );

  return {
    shouldRepair: severeIssues.length > 0,
    reason:
      severeIssues.length > 0
        ? 'High severity UI issues detected.'
        : 'No severe UI issues detected.',
  };
}
