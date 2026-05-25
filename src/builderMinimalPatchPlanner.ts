import type { VerifiedEditState } from "./vivusExecutionLoop";

export type BuilderPatchScope = {
  mode: "minimal" | "moderate" | "full";
  confidence: number;
  reason: string;
  maxTouchedAreas: number;
};

const LARGE_DIFF_THRESHOLD = 18000;
const SMALL_DIFF_THRESHOLD = 4000;

function estimateTouchedAreas(diff: string) {
  const matches = diff.match(/^@@/gm);
  return matches?.length ?? 1;
}

export function determinePatchScope(state: VerifiedEditState): BuilderPatchScope {
  const diff = state.proposal?.diffPreview ?? "";
  const touchedAreas = estimateTouchedAreas(diff);
  const diffSize = diff.length;

  if (!state.proposal?.changed) {
    return {
      mode: "minimal",
      confidence: 0.95,
      reason: "No changed diff detected.",
      maxTouchedAreas: 1,
    };
  }

  if (diffSize <= SMALL_DIFF_THRESHOLD && touchedAreas <= 3) {
    return {
      mode: "minimal",
      confidence: 0.92,
      reason: "Small scoped diff affecting limited areas.",
      maxTouchedAreas: 3,
    };
  }

  if (diffSize <= LARGE_DIFF_THRESHOLD && touchedAreas <= 8) {
    return {
      mode: "moderate",
      confidence: 0.8,
      reason: "Moderately scoped diff across several regions.",
      maxTouchedAreas: 8,
    };
  }

  return {
    mode: "full",
    confidence: 0.55,
    reason: "Large or broadly-scoped replacement detected.",
    maxTouchedAreas: touchedAreas,
  };
}

export function summarizePatchScope(scope: BuilderPatchScope) {
  return `${scope.mode} patch (${Math.round(scope.confidence * 100)}% confidence): ${scope.reason}`;
}
