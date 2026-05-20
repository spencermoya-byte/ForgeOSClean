import { runSafeBuilderCommand } from "./builderExecution";
import {
  applyApprovedBuilderPatch,
  createBuilderPatchCheckpoint,
  previewBuilderFilePatch,
  readPatchBaseContent,
  restoreBuilderPatchCheckpoint,
} from "./builderPatchBridge";

const MAX_PATCH_ATTEMPTS = 2;

export type VerifiedPatchRequest = {
  relativePath: string;
  nextContent: string;
};

export type VerifiedWorkflowStatus =
  | "planned"
  | "previewed"
  | "checkpointed"
  | "patched"
  | "verified"
  | "rolled_back"
  | "failed";

export type VerifiedWorkflowResult = {
  ok: boolean;
  status: VerifiedWorkflowStatus;
  message: string;
  checkpointId: string | null;
  diffPreview: string | null;
  verificationOutput: string | null;
  rollbackTriggered: boolean;
  blockedReason: string | null;
};

export async function runVerifiedBuilderWorkflow(
  patch: VerifiedPatchRequest,
  projectPath = "."
): Promise<VerifiedWorkflowResult> {
  let attempts = 0;
  let checkpointId: string | null = null;

  while (attempts < MAX_PATCH_ATTEMPTS) {
    attempts += 1;

    const baseContent = await readPatchBaseContent(patch.relativePath, projectPath);
    if (baseContent === null) {
      return {
        ok: false,
        status: "failed",
        message: "Vivus could not inspect the approved file before patching.",
        checkpointId,
        diffPreview: null,
        verificationOutput: null,
        rollbackTriggered: false,
        blockedReason: "File inspection failed.",
      };
    }

    const preview = await previewBuilderFilePatch(
      patch.relativePath,
      patch.nextContent,
      projectPath
    );

    if (!preview.ok) {
      return {
        ok: false,
        status: "failed",
        message: "Patch preview was blocked.",
        checkpointId,
        diffPreview: preview.diffPreview,
        verificationOutput: null,
        rollbackTriggered: false,
        blockedReason: preview.blockedReason,
      };
    }

    const checkpoint = await createBuilderPatchCheckpoint(
      [patch.relativePath],
      projectPath
    );

    if (!checkpoint.ok || !checkpoint.checkpointId) {
      return {
        ok: false,
        status: "failed",
        message: "Checkpoint creation failed before patching.",
        checkpointId,
        diffPreview: preview.diffPreview,
        verificationOutput: null,
        rollbackTriggered: false,
        blockedReason: checkpoint.blockedReason,
      };
    }

    checkpointId = checkpoint.checkpointId;

    const applied = await applyApprovedBuilderPatch(
      patch.relativePath,
      baseContent,
      patch.nextContent,
      projectPath
    );

    if (!applied.ok) {
      return {
        ok: false,
        status: "failed",
        message: "Approved patch failed during application.",
        checkpointId,
        diffPreview: preview.diffPreview,
        verificationOutput: null,
        rollbackTriggered: false,
        blockedReason: applied.blockedReason,
      };
    }

    const verification = await runSafeBuilderCommand("npm_build", projectPath);

    if (verification.ok) {
      return {
        ok: true,
        status: "verified",
        message: "Verified Fixed: patch applied and build verification passed.",
        checkpointId,
        diffPreview: preview.diffPreview,
        verificationOutput: [verification.stderr, verification.stdout].filter(Boolean).join("\n"),
        rollbackTriggered: false,
        blockedReason: null,
      };
    }

    if (checkpointId) {
      await restoreBuilderPatchCheckpoint(checkpointId, projectPath);
    }

    if (attempts >= MAX_PATCH_ATTEMPTS) {
      return {
        ok: false,
        status: "rolled_back",
        message: "Build verification failed and Vivus rolled back the patch.",
        checkpointId,
        diffPreview: preview.diffPreview,
        verificationOutput: [verification.stderr, verification.stdout].filter(Boolean).join("\n"),
        rollbackTriggered: true,
        blockedReason: "Build verification failed.",
      };
    }
  }

  return {
    ok: false,
    status: "failed",
    message: "Vivus stopped to avoid a debugging loop.",
    checkpointId,
    diffPreview: null,
    verificationOutput: null,
    rollbackTriggered: false,
    blockedReason: "Maximum patch attempts reached.",
  };
}
