export type AcceptanceCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type AcceptanceResult = {
  passed: boolean;
  checks: AcceptanceCheck[];
};

export function evaluateAcceptanceCriteria(
  requestedCriteria: string[],
  verificationPassed: boolean,
): AcceptanceResult {
  const checks = requestedCriteria.map((criterion) => ({
    name: criterion,
    passed: verificationPassed,
    detail: verificationPassed
      ? 'Criterion satisfied.'
      : 'Criterion not verified.',
  }));

  return {
    passed: checks.every((c) => c.passed),
    checks,
  };
}
