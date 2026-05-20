import { runBuilderFileIntelligence, type BuilderFileCandidate, type BuilderFileIntelligenceResult } from "./builderExecution";

export type PatchRiskLevel = "low" | "medium" | "high";

export type BuilderPatchPlanTarget = {
  relativePath: string;
  reason: string;
  intendedChanges: string[];
  risk: PatchRiskLevel;
};

export type BuilderPatchPlan = {
  ok: boolean;
  summary: string;
  targets: BuilderPatchPlanTarget[];
  verificationPlan: string[];
  blockedActions: string[];
  intelligence: BuilderFileIntelligenceResult | null;
  blockedReason: string | null;
};

function requestWords(request: string) {
  return request.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);
}

function inferIntendedChanges(candidate: BuilderFileCandidate, request: string) {
  const path = candidate.relativePath.toLowerCase();
  const words = requestWords(request);
  const changes = new Set<string>();

  if (path.endsWith(".css")) {
    changes.add("Adjust styling rules only where they directly affect the requested UI behavior.");
  }

  if (path.endsWith(".tsx") || path.endsWith(".ts") || path.endsWith(".jsx") || path.endsWith(".js")) {
    changes.add("Update component logic or rendering only in the smallest relevant scope.");
  }

  if (path.includes("builder") || words.some((word) => ["builder", "plan", "workflow", "execution"].includes(word))) {
    changes.add("Preserve the existing Builder workflow and approval states while changing only the requested behavior.");
  }

  if (path.includes("app.")) {
    changes.add("Avoid broad app-level rewrites; touch only the branch or state needed for the request.");
  }

  if (path.includes("package.json")) {
    changes.add("Only change scripts or dependencies if the request explicitly requires it.");
  }

  if (path.includes("src-tauri") || path.endsWith(".rs")) {
    changes.add("Keep backend commands allowlisted, structured, and non-destructive.");
  }

  if (changes.size === 0) {
    changes.add("Inspect this file before deciding whether a minimal patch is necessary.");
  }

  return Array.from(changes);
}

function inferRisk(candidate: BuilderFileCandidate): PatchRiskLevel {
  const path = candidate.relativePath.toLowerCase();

  if (path.includes("src-tauri") || path.endsWith("cargo.toml") || path.endsWith("package.json")) {
    return "high";
  }

  if (path.endsWith("app.tsx") || path.endsWith("app.ts") || path.includes("main.")) {
    return "medium";
  }

  return "low";
}

export async function createPreviewPatchPlan(request: string, projectPath = "."): Promise<BuilderPatchPlan> {
  const trimmed = request.trim();

  if (!trimmed) {
    return {
      ok: false,
      summary: "Patch planning requires a build request.",
      targets: [],
      verificationPlan: [],
      blockedActions: ["No file edits were attempted."],
      intelligence: null,
      blockedReason: "Empty request.",
    };
  }

  const intelligence = await runBuilderFileIntelligence(trimmed, projectPath);

  if (!intelligence.ok) {
    return {
      ok: false,
      summary: "Vivus could not create a patch plan because file intelligence was blocked.",
      targets: [],
      verificationPlan: [],
      blockedActions: ["No file edits were attempted.", "No patches were generated.", "No terminal commands were run."],
      intelligence,
      blockedReason: intelligence.blockedReason,
    };
  }

  const targets = intelligence.candidates.slice(0, 5).map((candidate) => ({
    relativePath: candidate.relativePath,
    reason: candidate.reason,
    intendedChanges: inferIntendedChanges(candidate, trimmed),
    risk: inferRisk(candidate),
  }));

  return {
    ok: true,
    summary: targets.length
      ? `Preview patch plan created for ${targets.length} likely target file${targets.length === 1 ? "" : "s"}. This is planning only; no files were changed.`
      : "Preview patch planning completed, but no strong target files were identified.",
    targets,
    verificationPlan: [
      "Review selected target files before patching.",
      "Generate a minimal diff only after user approval.",
      "Run git diff --stat after patch generation.",
      "Run npm run build after frontend/backend-safe patch application.",
      "Report verified fixed only after objective checks pass.",
    ],
    blockedActions: [
      "File writes are disabled in this planning step.",
      "Patch application is disabled in this planning step.",
      "Rollback/checkpoint execution is not invoked by this planner.",
      "Arbitrary terminal commands remain blocked.",
    ],
    intelligence,
    blockedReason: null,
  };
}
