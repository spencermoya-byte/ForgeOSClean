export type ConfidenceSignal = {
  reason: string;
  weight: number;
};

export function calculatePatchConfidence(
  signals: ConfidenceSignal[],
): number {
  if (!signals.length) {
    return 0.5;
  }

  const total = signals.reduce(
    (sum, signal) => sum + signal.weight,
    0,
  );

  return Math.max(
    0,
    Math.min(1, total / signals.length),
  );
}
