import type { VerifiedEditState } from "./vivusExecutionLoop";

export type BuilderReliabilityIssue = {
  severity: "low" | "medium" | "high";
  reason: string;
};

export type BuilderReliabilityResult = {
  safe: boolean;
  confidence: number;
  issues: BuilderReliabilityIssue[];
  recommendation: string;
};

function estimateConfidence(state: VerifiedEditState) {
  let confidence = 0.92;

  if (state.stage === "blocked") confidence -= 0.5;
  if (!state.proposal?.changed) confidence -= 0.25;
  if (!state.proposal?.diffPreview?.trim()) confidence -= 0.15;
  if ((state.proposal?.diffPreview?.length ?? 0) > 25000) confidence -= 0.12;
  if (state.message.toLowerCase().includes("fallback")) confidence -= 0.18;
  if (state.stage === "repaired") confidence -= 0.1;

  return Math.max(0.05, Math.min(0.99, confidence));
}

function collectIssues(state: VerifiedEditState): BuilderReliabilityIssue[] {
  const issues: BuilderReliabilityIssue[] = [];

  if (state.stage === "blocked") {
    issues.push({ severity: "high", reason: "Execution ended in blocked state." });
  }

  if (!state.proposal?.changed) {
    issues.push({ severity: "medium", reason: "No changed diff was produced." });
  }

  if (!state.proposal?.diffPreview?.trim()) {
    issues.push({ severity: "medium", reason: "Missing diff preview." });
  }

  if ((state.proposal?.diffPreview?.length ?? 0) > 25000) {
    issues.push({ severity: "medium", reason: "Patch is unusually large and may be over-scoped." });
  }

  if (state.message.toLowerCase().includes("fallback")) {
    issues.push({ severity: "high", reason: "Fallback generation path was used." });
  }

  if (state.stage === "repaired") {
    issues.push({ severity: "low", reason: "Repair pass was required after verification." });
  }

  return issues;
}

export function assessBuilderPatchReliability(state: VerifiedEditState): BuilderReliabilityResult {
  const confidence = estimateConfidence(state);
  const issues = collectIssues(state);

  const safe = confidence >= 0.72 && !issues.some((issue) => issue.severity === "high");

  return {
    safe,
    confidence,
    issues,
    recommendation: safe
      ? "Patch reliability acceptable. Safe to continue with approval workflow."
      : "Patch reliability below threshold. Review scope or retry with narrower task.",
  };
}
