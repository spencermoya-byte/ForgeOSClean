export type RegionAnchorResult = {
  anchored: boolean;
  reason: string;
  matchedRegions: string[];
};

const REGION_HINTS: Record<string, RegExp[]> = {
  ui: [/className=/g, /return\s*\(/g, /function\s+[A-Z]/g],
  styles: [/\.[a-zA-Z0-9_-]+\s*\{/g, /@media/g],
  builder: [/builder/gi, /execution/gi, /verification/gi, /patch/gi],
};

function inferIntent(plan: string) {
  const lower = plan.toLowerCase();
  if (/(spacing|layout|responsive|button|dock|panel|header|ui|css)/i.test(lower)) return 'ui';
  if (/(style|theme|tailwind)/i.test(lower)) return 'styles';
  if (/(builder|execution|verification|patch|repair|ollama)/i.test(lower)) return 'builder';
  return 'ui';
}

export function anchorBuilderTargetRegions(currentContent: string, planSummary: string): RegionAnchorResult {
  const patterns = REGION_HINTS[inferIntent(planSummary)] ?? [];
  const matches = patterns.flatMap((pattern) =>
    [...currentContent.matchAll(pattern)].slice(0, 4).map((m) => m[0]),
  );

  const matchedRegions = [...new Set(matches)].slice(0, 10);

  return {
    anchored: matchedRegions.length > 0,
    reason: matchedRegions.length
      ? `Anchored generation to ${matchedRegions.length} region(s).`
      : 'No target regions matched.',
    matchedRegions,
  };
}
