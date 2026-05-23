import {
  applyApprovedFilePatch,
  createPatchCheckpoint,
  previewFilePatch,
  readProjectFile,
  restorePatchCheckpoint,
  type BuilderCheckpointResponse,
  type BuilderPatchResponse,
  type FileInspectionResponse,
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

const DEFAULT_PROJECT_PATH = ".";
const DEFAULT_RELATIVE_PATH = "src/App.tsx";

function steps(overrides: Partial<Record<string, VerifiedEditStep["status"]>> = {}): VerifiedEditStep[] {
  return [
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

function makeFallbackNextContent(current: string, planSummary: string): string {
  const marker = "// Vivus verified edit loop marker";
  if (current.includes(marker)) return current;
  return `${current.trimEnd()}\n\n${marker}\n// Plan: ${planSummary.slice(0, 180).replace(/\n/g, " ")}\n`;
}

function buildCoderPrompt(relativePath: string, currentContent: string, planSummary: string): string {
  return `You are Vivus local coder. Produce a complete replacement for the target file only.\n\nRules:\n- Return only the complete file wrapped in <FULL_FILE> and </FULL_FILE>.\n- Do not explain.\n- Preserve existing imports, behavior, and UI unless the plan requires changing them.\n- Make the smallest safe change that helps satisfy the plan.\n- Do not add unrelated features.\n\nTarget file: ${relativePath}\n\nApproved plan:\n${planSummary}\n\nCurrent file:\n\`\`\`tsx\n${currentContent}\n\`\`\`\n`;
}

async function generateNextContent(relativePath: string, currentContent: string, planSummary: string, explicitNextContent?: string) {
  if (explicitNextContent) {
    return { content: explicitNextContent, generatedBy: "manual override" };
  }

  const status = await getOllamaStatus();
  if (!status.ok || status.models.length === 0) {
    return { content: makeFallbackNextContent(currentContent, planSummary), generatedBy: status.blockedReason ?? "fallback patch" };
  }

  const model = pickModel(status.models, "coder");
  if (!model) {
    return { content: makeFallbackNextContent(currentContent, planSummary), generatedBy: "fallback patch: no coder model found" };
  }

  const result = await generateWithOllama(
    model,
    buildCoderPrompt(relativePath, currentContent, planSummary),
    "You are a cautious local coding agent. You only output complete replacement file contents inside <FULL_FILE> tags.",
  );

  if (!result.ok) {
    return { content: makeFallbackNextContent(currentContent, planSummary), generatedBy: result.blockedReason ?? `fallback patch: ${model} failed` };
  }

  const extracted = extractFullFileResponse(result.response);
  if (!extracted) {
    return { content: makeFallbackNextContent(currentContent, planSummary), generatedBy: `fallback patch: ${model} returned no extractable file` };
  }

  return { content: extracted, generatedBy: model };
}

export async function prepareVerifiedEdit(request: VerifiedEditRequest): Promise<VerifiedEditState> {
  const projectPath = request.projectPath?.trim() || DEFAULT_PROJECT_PATH;
  const relativePath = request.relativePath?.trim() || DEFAULT_RELATIVE_PATH;
  const file = await readProjectFile(projectPath, relativePath);

  if (!file.ok) {
    return blocked(file.blockedReason ?? "Unable to inspect source file.", { inspect: "blocked" });
  }

  const generated = await generateNextContent(relativePath, file.content, request.planSummary, request.nextContent);
  const diff = await previewFilePatch(projectPath, relativePath, generated.content);

  if (!diff.ok) {
    return blocked(diff.blockedReason ?? "Unable to generate diff preview.", { inspect: "done", ai: "done", diff: "blocked" });
  }

  return {
    stage: "diff-ready",
    message: diff.changed
      ? `Diff preview is ready. Patch generated by ${generated.generatedBy}. Approve to checkpoint and apply.`
      : `No textual changes detected. Patch source: ${generated.generatedBy}.`,
    proposal: {
      projectPath,
      relativePath: diff.relativePath || relativePath,
      currentContent: file.content,
      nextContent: generated.content,
      diffPreview: diff.diffPreview,
      changed: diff.changed,
      generatedBy: generated.generatedBy,
    },
    steps: steps({ inspect: "done", ai: "done", diff: diff.changed ? "done" : "blocked" }),
  };
}

export async function checkpointVerifiedEdit(state: VerifiedEditState): Promise<VerifiedEditState> {
  if (!state.proposal) return blocked("Cannot create checkpoint without a prepared proposal.", { inspect: "done", ai: "done", diff: "done", checkpoint: "blocked" });

  const checkpoint = await createPatchCheckpoint(state.proposal.projectPath, [state.proposal.relativePath]);
  if (!checkpoint.ok) {
    return { ...state, stage: "blocked", message: checkpoint.blockedReason ?? "Checkpoint creation failed.", checkpoint, steps: steps({ inspect: "done", ai: "done", diff: "done", checkpoint: "blocked" }) };
  }

  return { ...state, stage: "checkpoint-ready", message: `Checkpoint created: ${checkpoint.checkpointId}`, checkpoint, steps: steps({ inspect: "done", ai: "done", diff: "done", checkpoint: "done" }) };
}

export async function applyAndVerifyEdit(state: VerifiedEditState, planSummary: string): Promise<VerifiedEditState> {
  if (!state.proposal || !state.checkpoint?.ok || !state.checkpoint.checkpointId) {
    return { ...state, stage: "blocked", message: "Cannot apply patch until a proposal and checkpoint exist.", steps: steps({ inspect: "done", ai: "done", diff: "done", checkpoint: state.checkpoint?.ok ? "done" : "blocked", apply: "blocked" }) };
  }

  const patch = await applyApprovedFilePatch(state.proposal.projectPath, state.proposal.relativePath, state.proposal.currentContent, state.proposal.nextContent, "APPROVE_PATCH");
  if (!patch.ok) {
    return { ...state, stage: "blocked", message: patch.blockedReason ?? "Patch application failed.", patchResult: patch, steps: steps({ inspect: "done", ai: "done", diff: "done", checkpoint: "done", apply: "blocked" }) };
  }

  const verification = await runBuilderExecutionPreview(planSummary);
  const verified = verification.tasks.every((task) => task.status !== "failed") && verification.activity.every((item) => item.status !== "blocked");

  if (verified) {
    return { ...state, stage: "verified", message: "Patch applied and verification passed.", patchResult: patch, verification, steps: steps({ inspect: "done", ai: "done", diff: "done", checkpoint: "done", apply: "done", verify: "done" }) };
  }

  const rollback = await restorePatchCheckpoint(state.proposal.projectPath, state.checkpoint.checkpointId);
  return {
    ...state,
    stage: rollback.ok ? "rolled-back" : "blocked",
    message: rollback.ok ? "Verification failed, so Vivus restored the rollback checkpoint." : rollback.blockedReason ?? "Verification failed and rollback could not be completed.",
    patchResult: patch,
    verification,
    rollback,
    steps: steps({ inspect: "done", ai: "done", diff: "done", checkpoint: "done", apply: "done", verify: "blocked", rollback: rollback.ok ? "done" : "blocked" }),
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
