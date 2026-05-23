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
import { runBuilderExecutionPreview, type BuilderExecutionResult } from "./builderExecution";
import { extractFullFileResponse, generateWithOllama, getOllamaStatus, pickModel } from "./builderOllama";

export type VerifiedEditStage =
  | "idle"
  | "inspecting"
  | "diff-ready"
  | "checkpoint-ready"
  | "applying"
  | "verifying"
  | "verified"
  | "rolled-back"
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
  rollback?: BuilderCheckpointResponse;
  steps: VerifiedEditStep[];
};

export type VerifiedEditRequest = {
  projectPath?: string;
  relativePath?: string;
  nextContent?: string;
  planSummary: string;
};

type TargetCandidate = {
  relativePath: string;
  score: number;
  reason: string;
};

type TargetSelection = {
  relativePath: string;
  reason: string;
  candidates: TargetCandidate[];
};

type ContextFile = {
  relativePath: string;
  content: string;
};

const DEFAULT_PROJECT_PATH = ".";
const DEFAULT_RELATIVE_PATH = "src/App.tsx";
const SOURCE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".css", ".rs", ".json"];
const MAX_CONTEXT_FILES = 4;
const MAX_CONTEXT_CHARS_PER_FILE = 6_000;

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
    { id: "rollback", label: "Rollback if failed", detail: "Restore checkpoint automatically if verification fails.", status: overrides.rollback ?? "pending" },
  ];
}

function blocked(message: string, overrides: Partial<Record<string, VerifiedEditStep["status"]>> = {}): VerifiedEditState {
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
  if (entry.entryType !== "file") return false;
  return SOURCE_EXTENSIONS.some((extension) => entry.relativePath.endsWith(extension));
}

function scoreEntry(entry: ProjectTreeEntry, planSummary: string): TargetCandidate {
  const lowerPlan = planSummary.toLowerCase();
  const path = entry.relativePath;
  const lowerPath = path.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  if (lowerPath.includes("app.tsx")) {
    score += 20;
    reasons.push("main app orchestrator");
  }
  if (lowerPath.includes("builder")) {
    score += 18;
    reasons.push("builder-related file");
  }
  if (lowerPath.includes("workflow")) {
    score += 12;
    reasons.push("workflow-related file");
  }
  if (lowerPath.includes("verified") || lowerPath.includes("execution")) {
    score += 12;
    reasons.push("execution/verification-related file");
  }
  if (lowerPath.endsWith(".css") && /(style|layout|visual|spacing|button|composer|panel|card|ui)/i.test(lowerPlan)) {
    score += 16;
    reasons.push("style request matched CSS file");
  }
  if (lowerPath.endsWith(".tsx") && /(button|panel|component|screen|page|builder|workflow|ui)/i.test(lowerPlan)) {
    score += 14;
    reasons.push("UI/component request matched TSX file");
  }
  if (lowerPath.endsWith(".rs") && /(tauri|backend|terminal|command|file|patch|ollama|local)/i.test(lowerPlan)) {
    score += 18;
    reasons.push("backend request matched Rust file");
  }
  if (lowerPath.includes("ollama") && /(ollama|model|ai|planner|coder)/i.test(lowerPlan)) {
    score += 28;
    reasons.push("Ollama/model request matched file");
  }
  if (lowerPath.includes("patch") && /(patch|diff|checkpoint|rollback|edit)/i.test(lowerPlan)) {
    score += 24;
    reasons.push("patch request matched file");
  }
  if (lowerPath.includes("file") && /(file|tree|editor|read|write)/i.test(lowerPlan)) {
    score += 18;
    reasons.push("file-system request matched file");
  }
  if (entry.sizeBytes && entry.sizeBytes > 180_000) {
    score -= 18;
    reasons.push("large file penalty");
  }

  return {
    relativePath: path,
    score,
    reason: reasons.length ? reasons.join(", ") : "general source candidate",
  };
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
  const entries = await collectProjectFiles(projectPath);
  const candidates = entries.map((entry) => scoreEntry(entry, planSummary)).sort((a, b) => b.score - a.score);

  if (explicitRelativePath?.trim()) {
    return { relativePath: explicitRelativePath.trim(), reason: "explicit target supplied", candidates };
  }

  const best = candidates.find((candidate) => candidate.score > 0) ?? candidates[0];

  if (best) {
    return { relativePath: best.relativePath, reason: `${best.reason}; score ${best.score}`, candidates };
  }

  return { relativePath: DEFAULT_RELATIVE_PATH, reason: "fallback default target", candidates: [] };
}

async function buildContextPack(projectPath: string, target: TargetSelection): Promise<ContextFile[]> {
  const contextPaths = target.candidates
    .filter((candidate) => candidate.relativePath !== target.relativePath)
    .slice(0, MAX_CONTEXT_FILES)
    .map((candidate) => candidate.relativePath);

  const context: ContextFile[] = [];

  for (const relativePath of contextPaths) {
    const file = await readProjectFile(projectPath, relativePath);
    if (!file.ok) continue;
    context.push({ relativePath, content: truncateForContext(file.content) });
  }

  return context;
}

function buildContextBlock(contextFiles: ContextFile[]) {
  if (!contextFiles.length) return "No additional context files were loaded.";
  return contextFiles
    .map((file) => `Context file: ${file.relativePath}\n\`\`\`\n${file.content}\n\`\`\``)
    .join("\n\n");
}

function buildCoderPrompt(relativePath: string, currentContent: string, planSummary: string, targetReason: string, contextFiles: ContextFile[]): string {
  return `You are Vivus local coder. Produce a complete replacement for the target file only.\n\nRules:\n- Return only the complete target file wrapped in <FULL_FILE> and </FULL_FILE>.\n- Do not explain.\n- Preserve existing imports, behavior, and UI unless the plan requires changing them.\n- Make the smallest safe change that helps satisfy the plan.\n- Do not edit or output any context file.\n- Use the context files only to understand relationships.\n\nTarget file: ${relativePath}\nTarget reason: ${targetReason}\n\nApproved plan:\n${planSummary}\n\nRelevant project context:\n${buildContextBlock(contextFiles)}\n\nCurrent target file:\n\`\`\`tsx\n${currentContent}\n\`\`\`\n`;
}

async function generateNextContent(relativePath: string, currentContent: string, planSummary: string, targetReason: string, contextFiles: ContextFile[], explicitNextContent?: string) {
  if (explicitNextContent) return { content: explicitNextContent, generatedBy: "manual override" };

  const status = await getOllamaStatus();
  if (!status.ok || status.models.length === 0) {
    return { content: makeFallbackNextContent(currentContent, planSummary), generatedBy: status.blockedReason ?? "fallback patch" };
  }

  const model = pickModel(status.models, "coder");
  if (!model) return { content: makeFallbackNextContent(currentContent, planSummary), generatedBy: "fallback patch: no coder model found" };

  const result = await generateWithOllama(
    model,
    buildCoderPrompt(relativePath, currentContent, planSummary, targetReason, contextFiles),
    "You are a cautious local coding agent. You only output complete replacement target file contents inside <FULL_FILE> tags.",
  );

  if (!result.ok) return { content: makeFallbackNextContent(currentContent, planSummary), generatedBy: result.blockedReason ?? `fallback patch: ${model} failed` };

  const extracted = extractFullFileResponse(result.response);
  if (!extracted) return { content: makeFallbackNextContent(currentContent, planSummary), generatedBy: `fallback patch: ${model} returned no extractable file` };

  return { content: extracted, generatedBy: model };
}

export async function prepareVerifiedEdit(request: VerifiedEditRequest): Promise<VerifiedEditState> {
  const projectPath = request.projectPath?.trim() || DEFAULT_PROJECT_PATH;
  const target = await inferTargetFile(projectPath, request.planSummary, request.relativePath);
  const relativePath = target.relativePath;
  const file = await readProjectFile(projectPath, relativePath);

  if (!file.ok) {
    return blocked(file.blockedReason ?? `Unable to inspect source file: ${relativePath}`, { target: "done", inspect: "blocked" });
  }

  const contextFiles = await buildContextPack(projectPath, target);
  const generated = await generateNextContent(relativePath, file.content, request.planSummary, target.reason, contextFiles, request.nextContent);
  const diff = await previewFilePatch(projectPath, relativePath, generated.content);

  if (!diff.ok) {
    return blocked(diff.blockedReason ?? "Unable to generate diff preview.", { target: "done", context: "done", inspect: "done", ai: "done", diff: "blocked" });
  }

  return {
    stage: "diff-ready",
    message: diff.changed
      ? `Diff preview is ready for ${relativePath}. Target reason: ${target.reason}. Context files: ${contextFiles.length}. Patch generated by ${generated.generatedBy}.`
      : `No textual changes detected for ${relativePath}. Target reason: ${target.reason}. Context files: ${contextFiles.length}. Patch source: ${generated.generatedBy}.`,
    proposal: {
      projectPath,
      relativePath: diff.relativePath || relativePath,
      currentContent: file.content,
      nextContent: generated.content,
      diffPreview: diff.diffPreview,
      changed: diff.changed,
      generatedBy: generated.generatedBy,
      targetReason: target.reason,
      contextFiles: contextFiles.map((contextFile) => contextFile.relativePath),
    },
    steps: steps({ target: "done", context: "done", inspect: "done", ai: "done", diff: diff.changed ? "done" : "blocked" }),
  };
}

export async function checkpointVerifiedEdit(state: VerifiedEditState): Promise<VerifiedEditState> {
  if (!state.proposal) return blocked("Cannot create checkpoint without a prepared proposal.", { target: "done", context: "done", inspect: "done", ai: "done", diff: "done", checkpoint: "blocked" });

  const checkpoint = await createPatchCheckpoint(state.proposal.projectPath, [state.proposal.relativePath]);
  if (!checkpoint.ok) {
    return { ...state, stage: "blocked", message: checkpoint.blockedReason ?? "Checkpoint creation failed.", checkpoint, steps: steps({ target: "done", context: "done", inspect: "done", ai: "done", diff: "done", checkpoint: "blocked" }) };
  }

  return { ...state, stage: "checkpoint-ready", message: `Checkpoint created: ${checkpoint.checkpointId}`, checkpoint, steps: steps({ target: "done", context: "done", inspect: "done", ai: "done", diff: "done", checkpoint: "done" }) };
}

export async function applyAndVerifyEdit(state: VerifiedEditState, planSummary: string): Promise<VerifiedEditState> {
  if (!state.proposal || !state.checkpoint?.ok || !state.checkpoint.checkpointId) {
    return { ...state, stage: "blocked", message: "Cannot apply patch until a proposal and checkpoint exist.", steps: steps({ target: "done", context: "done", inspect: "done", ai: "done", diff: "done", checkpoint: state.checkpoint?.ok ? "done" : "blocked", apply: "blocked" }) };
  }

  const patch = await applyApprovedFilePatch(state.proposal.projectPath, state.proposal.relativePath, state.proposal.currentContent, state.proposal.nextContent, "APPROVE_PATCH");
  if (!patch.ok) {
    return { ...state, stage: "blocked", message: patch.blockedReason ?? "Patch application failed.", patchResult: patch, steps: steps({ target: "done", context: "done", inspect: "done", ai: "done", diff: "done", checkpoint: "done", apply: "blocked" }) };
  }

  const verification = await runBuilderExecutionPreview(planSummary);
  const verified = verification.tasks.every((task) => task.status !== "failed") && verification.activity.every((item) => item.status !== "blocked");

  if (verified) {
    return { ...state, stage: "verified", message: "Patch applied and verification passed.", patchResult: patch, verification, steps: steps({ target: "done", context: "done", inspect: "done", ai: "done", diff: "done", checkpoint: "done", apply: "done", verify: "done" }) };
  }

  const rollback = await restorePatchCheckpoint(state.proposal.projectPath, state.checkpoint.checkpointId);
  return {
    ...state,
    stage: rollback.ok ? "rolled-back" : "blocked",
    message: rollback.ok ? "Verification failed, so Vivus restored the rollback checkpoint." : rollback.blockedReason ?? "Verification failed and rollback could not be completed.",
    patchResult: patch,
    verification,
    rollback,
    steps: steps({ target: "done", context: "done", inspect: "done", ai: "done", diff: "done", checkpoint: "done", apply: "done", verify: "blocked", rollback: rollback.ok ? "done" : "blocked" }),
  };
}

export async function runVerifiedEditLoop(request: VerifiedEditRequest): Promise<VerifiedEditState> {
  const prepared = await prepareVerifiedEdit(request);
  if (prepared.stage !== "diff-ready" || !prepared.proposal?.changed) return prepared;
  const checkpointed = await checkpointVerifiedEdit(prepared);
  if (checkpointed.stage !== "checkpoint-ready") return checkpointed;
  return applyAndVerifyEdit(checkpointed, request.planSummary);
}

export function summarizeFileInspection(file: FileInspectionResponse): string {
  if (!file.ok) return file.blockedReason ?? "File inspection blocked.";
  return `${file.relativePath} loaded (${file.sizeBytes ?? file.content.length} bytes${file.truncated ? ", truncated" : ""}).`;
}
