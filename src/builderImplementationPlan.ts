import type { ProjectTreeEntry } from "./builderPatchEngine";

export type BuilderImplementationPhase = {
  id: string;
  title: string;
  detail: string;
  required: boolean;
};

export type BuilderImplementationCandidate = {
  relativePath: string;
  score: number;
  reason: string;
};

export type BuilderImplementationPlan = {
  projectPath: string;
  request: string;
  summary: string;
  candidateFiles: BuilderImplementationCandidate[];
  phases: BuilderImplementationPhase[];
  acceptanceChecks: string[];
  blockedChanges: string[];
  riskLevel: "low" | "medium" | "high";
};

const FEATURE_TERMS = ["add", "build", "create", "implement", "wire", "integrate", "support", "enable"];
const FIX_TERMS = ["fix", "broken", "bug", "error", "issue", "failing", "not working", "crash"];
const UI_TERMS = ["ui", "layout", "panel", "button", "screen", "page", "dock", "composer", "resize", "responsive"];
const BACKEND_TERMS = ["tauri", "rust", "backend", "command", "filesystem", "terminal", "patch", "checkpoint", "rollback"];
const MODEL_TERMS = ["ollama", "model", "ai", "planner", "coder", "vision", "local model"];

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function isSourceLike(entry: ProjectTreeEntry) {
  return entry.entryType === "file" && /\.(tsx|ts|jsx|js|css|rs|json)$/i.test(entry.relativePath);
}

function scorePath(entry: ProjectTreeEntry, request: string): BuilderImplementationCandidate | null {
  if (!isSourceLike(entry)) return null;

  const path = entry.relativePath.toLowerCase();
  const text = request.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  if (path.includes("builder")) {
    score += 18;
    reasons.push("builder subsystem");
  }

  if (path.includes("workspace")) {
    score += 12;
    reasons.push("workspace subsystem");
  }

  if (path.includes("preview")) {
    score += 10;
    reasons.push("preview subsystem");
  }

  if (path.includes("ollama") || path.includes("model")) {
    score += includesAny(text, MODEL_TERMS) ? 28 : 8;
    reasons.push("local model subsystem");
  }

  if (path.includes("patch") || path.includes("checkpoint") || path.includes("rollback") || path.includes("execution")) {
    score += includesAny(text, BACKEND_TERMS) || includesAny(text, FIX_TERMS) ? 28 : 10;
    reasons.push("execution/patch subsystem");
  }

  if ((path.endsWith(".css") || path.includes("panel")) && includesAny(text, UI_TERMS)) {
    score += 18;
    reasons.push("UI/layout request match");
  }

  if (path.endsWith(".rs") && includesAny(text, BACKEND_TERMS)) {
    score += 24;
    reasons.push("backend/Rust request match");
  }

  if (path.endsWith(".tsx") && includesAny(text, FEATURE_TERMS)) {
    score += 10;
    reasons.push("feature implementation candidate");
  }

  if (entry.sizeBytes && entry.sizeBytes > 180_000) {
    score -= 20;
    reasons.push("large file penalty");
  }

  if (score <= 0) return null;

  return {
    relativePath: entry.relativePath,
    score,
    reason: reasons.join(", "),
  };
}

function riskLevel(request: string, candidates: BuilderImplementationCandidate[]) {
  const text = request.toLowerCase();
  if (includesAny(text, ["delete", "remove", "rewrite", "replace everything", "migration", "security", "filesystem", "terminal"])) return "high";
  if (candidates.length > 4 || includesAny(text, ["integrate", "backend", "tauri", "multi-file", "architecture"])) return "medium";
  return "low";
}

export function createBuilderImplementationPlan(
  projectPath: string,
  request: string,
  entries: ProjectTreeEntry[],
): BuilderImplementationPlan {
  const candidateFiles = entries
    .map((entry) => scorePath(entry, request))
    .filter((entry): entry is BuilderImplementationCandidate => Boolean(entry))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const phases: BuilderImplementationPhase[] = [
    { id: "scope", title: "Scope implementation", detail: "Resolve the user request into specific candidate files and blocked changes.", required: true },
    { id: "inspect", title: "Inspect files", detail: "Read the current source before proposing any patch.", required: true },
    { id: "patch", title: "Generate patch", detail: "Produce the smallest safe implementation patch for the selected file set.", required: true },
    { id: "verify", title: "Verify", detail: "Run the protected verification chain before marking work complete.", required: true },
    { id: "rollback", title: "Rollback on failure", detail: "Restore checkpoint if verification fails.", required: true },
  ];

  return {
    projectPath,
    request,
    summary: `Implementation plan for: ${request}`,
    candidateFiles,
    phases,
    acceptanceChecks: [
      "The requested behavior is implemented in the active workspace only.",
      "Only files selected by the implementation plan are changed.",
      "A diff is produced before any write is applied.",
      "A checkpoint exists before file writes occur.",
      "Verification passes before the result can be marked Verified Fixed.",
    ],
    blockedChanges: [
      "Do not access or edit Vivus app internals from Builder execution.",
      "Do not edit files outside the active user workspace.",
      "Do not make broad rewrites when a scoped patch is sufficient.",
      "Do not claim success unless verification passes.",
    ],
    riskLevel: riskLevel(request, candidateFiles),
  };
}
