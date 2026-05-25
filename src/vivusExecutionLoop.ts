import {
  applyApprovedFilePatch,
  createPatchCheckpoint,
  listProjectTree,
  previewFilePatch,
  readProjectFile,
  restorePatchCheckpoint,
  type BuilderCheckpointResponse,
  type BuilderPatchResponse,
  type FileInspectionResponse,
  type ProjectTreeEntry,
} from "./builderPatchEngine";
import { runBuilderExecutionPreview, type BuildDiagnostic, type BuilderExecutionResult } from "./builderExecution";
import { validateGeneratedFile } from "./builderGeneratedFileValidator";
import { extractFullFileResponse, generateWithOllama, getOllamaStatus, pickModel } from "./builderOllama";
import { createBuilderImplementationPlan } from "./builderImplementationPlan";
import { getWorkspaceProjectPath, syncWorkspaceFile } from "./workspaceSync";
import { emitBuilderExecutionEvent } from "./builderExecutionEvents";

export type VerifiedEditStage =
  | "idle"
  | "inspecting"
  | "diff-ready"
  | "checkpoint-ready"
  | "applying"
  | "verifying"
  | "verified"
  | "rolled-back"
  | "repaired"
  | "blocked";

export type VerifiedEditStep = {
  id: string;
  label: string;
  detail: string;
  status: "pending" | "active" | "done" | "blocked";
};

export type VerifiedEditProposal = {
  projectPath: string;
  relativePath: string;
  currentContent: string;
  nextContent: string;
  diffPreview: string;
  changed: boolean;
  generatedBy?: string;
  targetReason?: string;
  contextFiles?: string[];
};

export type VerifiedEditState = {
  stage: VerifiedEditStage;
  message: string;
  proposal?: VerifiedEditProposal;
  checkpoint?: BuilderCheckpointResponse;
  patchResult?: BuilderPatchResponse;
  verification?: BuilderExecutionResult;
  repairVerification?: BuilderExecutionResult;
  rollback?: BuilderCheckpointResponse;
  repairAttempted?: boolean;
  steps: VerifiedEditStep[];
};

export type VerifiedEditRequest = {
  projectPath?: string;
  relativePath?: string;
  nextContent?: string;
  planSummary: string;
};

type TargetCandidate = { relativePath: string; score: number; reason: string };
type TargetSelection = { relativePath: string; reason: string; candidates: TargetCandidate[] };
type ContextFile = { relativePath: string; content: string };

const DEFAULT_RELATIVE_PATH = "src/App.tsx";
const SOURCE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".css", ".rs", ".json"];
const MAX_CONTEXT_FILES = 4;
const MAX_CONTEXT_CHARS_PER_FILE = 6_000;

function emitExecution(type: Parameters<typeof emitBuilderExecutionEvent>[0]["type"], label: string, detail: string, status: Parameters<typeof emitBuilderExecutionEvent>[0]["status"]) {
  emitBuilderExecutionEvent({ type, label, detail, status });
}

function dispatchPreviewRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("vivus-preview-refresh"));
}

function steps(overrides: Partial<Record<string, VerifiedEditStep["status"]>> = {}): VerifiedEditStep[] {
  return [
    { id: "target", label: "Infer target file", detail: "Rank project files and choose the safest file to inspect.", status: overrides.target ?? "pending" },
    { id: "context", label: "Build repo context", detail: "Read nearby relevant files so the model has project awareness.", status: overrides.context ?? "pending" },
    { id: "inspect", label: "Inspect source file", detail: "Read the current file before proposing changes.", status: overrides.inspect ?? "pending" },
    { id: "ai", label: "Generate AI patch", detail: "Use the local coder model to produce a full-file patch candidate.", status: overrides.ai ?? "pending" },
    { id: "diff", label: "Generate diff preview", detail: "Prepare a user-reviewable diff before writing anything.", status: overrides.diff ?? "pending" },
    { id: "checkpoint", label: "Create rollback checkpoint", detail: "Back up every touched file before applying a patch.", status: overrides.checkpoint ?? "pending" },
    { id: "apply", label: "Apply approved patch", detail: "Write only after explicit approval and base-content verification.", status: overrides.apply ?? "pending" },
    { id: "verify", label: "Run verification", detail: "Run the safe execution bridge and build checks after patching.", status: overrides.verify ?? "pending" },
    { id: "repair", label: "Attempt auto repair", detail: "Use build diagnostics to attempt one self-repair pass.", status: overrides.repair ?? "pending" },
    { id: "rollback", label: "Rollback if failed", detail: "Restore checkpoint automatically if verification fails.", status: overrides.rollback ?? "pending" },
  ];
}

function blocked(message: string, overrides: Partial<Record<string, VerifiedEditStep["status"]>> = {}): VerifiedEditState {
  emitExecution("blocked", "Blocked", message, "blocked");
  return { stage: "blocked", message, steps: steps(overrides) };
}

function truncateForContext(content: string) {
  if (content.length <= MAX_CONTEXT_CHARS_PER_FILE) return content;
  return `${content.slice(0, MAX_CONTEXT_CHARS_PER_FILE)}\n\n/* Vivus context truncated */`;
}

function makeFallbackNextContent(current: string, planSummary: string): string {
  const marker = "// Vivus verified edit loop marker";
  if (current.includes(marker)) return current;
  return `${current.trimEnd()}\n\n${marker}\n// Plan: ${planSummary.slice(0, 180).replace(/\n/g, " ")}\n`;
}

function isSourceFile(entry: ProjectTreeEntry) {
  return entry.entryType === "file" && SOURCE_EXTENSIONS.some((extension) => entry.relativePath.endsWith(extension));
}

function scoreEntry(entry: ProjectTreeEntry, planSummary: string): TargetCandidate {
  const lowerPlan = planSummary.toLowerCase();
  const path = entry.relativePath;
  const lowerPath = path.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  if (lowerPath.includes("app.tsx")) { score += 20; reasons.push("main app orchestrator"); }
  if (lowerPath.includes("builder")) { score += 18; reasons.push("builder-related file"); }
  if (lowerPath.includes("workflow")) { score += 12; reasons.push("workflow-related file"); }
  if (lowerPath.includes("verified") || lowerPath.includes("execution")) { score += 12; reasons.push("execution/verification-related file"); }
  if (lowerPath.endsWith(".css") && /(style|layout|visual|spacing|button|composer|panel|card|ui)/i.test(lowerPlan)) { score += 16; reasons.push("style request matched CSS file"); }
  if (lowerPath.endsWith(".tsx") && /(button|panel|component|screen|page|builder|workflow|ui)/i.test(lowerPlan)) { score += 14; reasons.push("UI/component request matched TSX file"); }
  if (lowerPath.endsWith(".rs") && /(tauri|backend|terminal|command|file|patch|ollama|local)/i.test(lowerPlan)) { score += 18; reasons.push("backend request matched Rust file"); }
  if (lowerPath.includes("ollama") && /(ollama|model|ai|planner|coder)/i.test(lowerPlan)) { score += 28; reasons.push("Ollama/model request matched file"); }
  if (lowerPath.includes("patch") && /(patch|diff|checkpoint|rollback|edit)/i.test(lowerPlan)) { score += 24; reasons.push("patch request matched file"); }
  if (lowerPath.includes("file") && /(file|tree|editor|read|write)/i.test(lowerPlan)) { score += 18; reasons.push("file-system request matched file"); }
  if (entry.sizeBytes && entry.sizeBytes > 180_000) { score -= 18; reasons.push("large file penalty"); }

  return { relativePath: path, score, reason: reasons.length ? reasons.join(", ") : "general source candidate" };
}

async function collectProjectFiles(projectPath: string) {
  const roots = ["src", "src-tauri/src"];
  const entries: ProjectTreeEntry[] = [];
  for (const root of roots) {
    const tree = await listProjectTree(projectPath, root);
    if (!tree.ok) continue;
    entries.push(...tree.entries.filter(isSourceFile));
  }
  return entries;
}

async function inferTargetFile(projectPath: string, planSummary: string, explicitRelativePath?: string): Promise<TargetSelection> {
  emitExecution("infer-target", "Infer target file", "Ranking source files for the safest edit target.", "active");
  const entries = await collectProjectFiles(projectPath);
  const fallbackCandidates = entries.map((entry) => scoreEntry(entry, planSummary)).sort((a, b) => b.score - a.score);

  if (explicitRelativePath?.trim()) {
    emitExecution("infer-target", "Target selected", explicitRelativePath.trim(), "done");
    return { relativePath: explicitRelativePath.trim(), reason: "explicit target supplied", candidates: fallbackCandidates };
  }

  const implementationPlan = createBuilderImplementationPlan(projectPath, planSummary, entries);
  const candidates = implementationPlan.candidateFiles.length > 0 ? implementationPlan.candidateFiles : fallbackCandidates;
  const best = candidates.find((candidate) => candidate.score > 0) ?? candidates[0];

  if (best) {
    const reason = `${best.reason}; score ${best.score}; risk ${implementationPlan.riskLevel}`;
    emitExecution("infer-target", "Target selected", `${best.relativePath} (${reason})`, "done");
    return { relativePath: best.relativePath, reason, candidates };
  }

  emitExecution("infer-target", "Target selected", DEFAULT_RELATIVE_PATH, "done");
  return { relativePath: DEFAULT_RELATIVE_PATH, reason: "fallback default target", candidates: [] };
}
