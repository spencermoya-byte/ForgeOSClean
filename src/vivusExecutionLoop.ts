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
    {
      id: "inspect",
      label: "Inspect source file",
      detail: "Read the current file before proposing changes.",
      status: overrides.inspect ?? "pending",
    },
    {
      id: "diff",
      label: "Generate diff preview",
      detail: "Prepare a user-reviewable diff before writing anything.",
      status: overrides.diff ?? "pending",
    },
    {
      id: "checkpoint",
      label: "Create rollback checkpoint",
      detail: "Back up every touched file before applying a patch.",
      status: overrides.checkpoint ?? "pending",
    },
    {
      id: "apply",
      label: "Apply approved patch",
      detail: "Write only after explicit approval and base-content verification.",
      status: overrides.apply ?? "pending",
    },
    {
      id: "verify",
      label: "Run verification",
      detail: "Run the safe execution bridge and build checks after patching.",
      status: overrides.verify ?? "pending",
    },
    {
      id: "rollback",
      label: "Rollback if failed",
      detail: "Restore checkpoint automatically if verification fails.",
      status: overrides.rollback ?? "pending",
    },
  ];
}

function blocked(message: string, overrides: Partial<Record<string, VerifiedEditStep["status"]>> = {}): VerifiedEditState {
  return {
    stage: "blocked",
    message,
    steps: steps(overrides),
  };
}

function makeFallbackNextContent(current: string, planSummary: string): string {
  const marker = "// Vivus verified edit loop marker";
  if (current.includes(marker)) {
    return current;
  }

  return `${current.trimEnd()}\n\n${marker}\n// Plan: ${planSummary.slice(0, 180).replace(/\n/g, " ")}\n`;
}

export async function prepareVerifiedEdit(request: VerifiedEditRequest): Promise<VerifiedEditState> {
  const projectPath = request.projectPath?.trim() || DEFAULT_PROJECT_PATH;
  const relativePath = request.relativePath?.trim() || DEFAULT_RELATIVE_PATH;
  const file = await readProjectFile(projectPath, relativePath);

  if (!file.ok) {
    return blocked(file.blockedReason ?? "Unable to inspect source file.", { inspect: "blocked" });
  }

  const nextContent = request.nextContent ?? makeFallbackNextContent(file.content, request.planSummary);
  const diff = await previewFilePatch(projectPath, relativePath, nextContent);

  if (!diff.ok) {
    return blocked(diff.blockedReason ?? "Unable to generate diff preview.", { inspect: "done", diff: "blocked" });
  }

  return {
    stage: "diff-ready",
    message: diff.changed ? "Diff preview is ready. Approve to checkpoint and apply." : "No textual changes detected.",
    proposal: {
      projectPath,
      relativePath: diff.relativePath || relativePath,
      currentContent: file.content,
      nextContent,
      diffPreview: diff.diffPreview,
      changed: diff.changed,
    },
    steps: steps({ inspect: "done", diff: diff.changed ? "done" : "blocked" }),
  };
}

export async function checkpointVerifiedEdit(state: VerifiedEditState): Promise<VerifiedEditState> {
  if (!state.proposal) {
    return blocked("Cannot create checkpoint without a prepared proposal.", { inspect: "done", diff: "done", checkpoint: "blocked" });
  }

  const checkpoint = await createPatchCheckpoint(state.proposal.projectPath, [state.proposal.relativePath]);

  if (!checkpoint.ok) {
    return {
      ...state,
      stage: "blocked",
      message: checkpoint.blockedReason ?? "Checkpoint creation failed.",
      checkpoint,
      steps: steps({ inspect: "done", diff: "done", checkpoint: "blocked" }),
    };
  }

  return {
    ...state,
    stage: "checkpoint-ready",
    message: `Checkpoint created: ${checkpoint.checkpointId}`,
    checkpoint,
    steps: steps({ inspect: "done", diff: "done", checkpoint: "done" }),
  };
}

export async function applyAndVerifyEdit(state: VerifiedEditState, planSummary: string): Promise<VerifiedEditState> {
  if (!state.proposal || !state.checkpoint?.ok || !state.checkpoint.checkpointId) {
    return {
      ...state,
      stage: "blocked",
      message: "Cannot apply patch until a proposal and checkpoint exist.",
      steps: steps({ inspect: "done", diff: "done", checkpoint: state.checkpoint?.ok ? "done" : "blocked", apply: "blocked" }),
    };
  }

  const patch = await applyApprovedFilePatch(
    state.proposal.projectPath,
    state.proposal.relativePath,
    state.proposal.currentContent,
    state.proposal.nextContent,
    "APPROVE_PATCH",
  );

  if (!patch.ok) {
    return {
      ...state,
      stage: "blocked",
      message: patch.blockedReason ?? "Patch application failed.",
      patchResult: patch,
      steps: steps({ inspect: "done", diff: "done", checkpoint: "done", apply: "blocked" }),
    };
  }

  const verification = await runBuilderExecutionPreview(planSummary);
  const verified = verification.tasks.every((task) => task.status !== "failed") && verification.activity.every((item) => item.status !== "blocked");

  if (verified) {
    return {
      ...state,
      stage: "verified",
      message: "Patch applied and verification passed.",
      patchResult: patch,
      verification,
      steps: steps({ inspect: "done", diff: "done", checkpoint: "done", apply: "done", verify: "done" }),
    };
  }

  const rollback = await restorePatchCheckpoint(state.proposal.projectPath, state.checkpoint.checkpointId);

  return {
    ...state,
    stage: rollback.ok ? "rolled-back" : "blocked",
    message: rollback.ok
      ? "Verification failed, so Vivus restored the rollback checkpoint."
      : rollback.blockedReason ?? "Verification failed and rollback could not be completed.",
    patchResult: patch,
    verification,
    rollback,
    steps: steps({ inspect: "done", diff: "done", checkpoint: "done", apply: "done", verify: "blocked", rollback: rollback.ok ? "done" : "blocked" }),
  };
}

export async function runVerifiedEditLoop(request: VerifiedEditRequest): Promise<VerifiedEditState> {
  const prepared = await prepareVerifiedEdit(request);
  if (prepared.stage !== "diff-ready" || !prepared.proposal?.changed) {
    return prepared;
  }

  const checkpointed = await checkpointVerifiedEdit(prepared);
  if (checkpointed.stage !== "checkpoint-ready") {
    return checkpointed;
  }

  return applyAndVerifyEdit(checkpointed, request.planSummary);
}

export function summarizeFileInspection(file: FileInspectionResponse): string {
  if (!file.ok) {
    return file.blockedReason ?? "File inspection blocked.";
  }
  return `${file.relativePath} loaded (${file.sizeBytes ?? file.content.length} bytes${file.truncated ? ", truncated" : ""}).`;
}
