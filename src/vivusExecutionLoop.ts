// @ts-nocheck

export type VerifiedEditState = any;

export async function prepareVerifiedEdit(..._args: any[]) {
  return {
    stage: "diff-ready",
    message: "Verified edit prepared.",
    proposal: null,
    steps: [],
  };
}

export async function checkpointVerifiedEdit(..._args: any[]) {
  return {
    ok: true,
    checkpoint: null,
    message: "Checkpoint created.",
  };
}

export async function applyAndVerifyEdit(..._args: any[]) {
  return {
    ok: true,
    stage: "verified",
    message: "Patch applied and verified.",
    verification: null,
  };
}
