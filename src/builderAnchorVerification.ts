export type AnchorVerificationResult = {
  ok: boolean;
  touchedAnchors: string[];
  violations: string[];
  reason: string;
};

export function verifyAnchoredEdit(previousContent: string, nextContent: string, anchors: string[] = []): AnchorVerificationResult {
  if (!anchors.length) {
    return {
      ok: true,
      touchedAnchors: [],
      violations: [],
      reason: 'No anchors provided. Verification bypassed.',
    };
  }

  const touchedAnchors = anchors.filter(anchor =>
    previousContent.includes(anchor) || nextContent.includes(anchor),
  );

  const violations: string[] = [];
  const changedMagnitude = Math.abs(nextContent.length - previousContent.length);

  if (!touchedAnchors.length) {
    violations.push('Generated edit did not touch anchored regions.');
  }

  if (changedMagnitude > Math.max(2500, previousContent.length * 0.4)) {
    violations.push('Generated edit appears over-scoped for anchored mode.');
  }

  return {
    ok: violations.length === 0,
    touchedAnchors,
    violations,
    reason: violations.length === 0
      ? `Verified ${touchedAnchors.length} anchored region(s).`
      : violations.join(' '),
  };
}
