// @ts-nocheck

export type VerifiedEditStep = {
  id: string;
  label: string;
  detail: string;
  status: "pending" | "active" | "done" | "blocked";
};

export type VerifiedEditProposal = {
  relativePath: string;
  diffPreview: string;
  changed: boolean;
};

export type VerifiedEditState = {
  stage: string;
  message: string;
  proposal?: VerifiedEditProposal | null;
  verification?: { message?: string } | null;
  checkpoint?: { checkpointId?: string } | null;
  patchResult?: { ok?: boolean; blockedReason?: string | null } | null;
  rollback?: { ok?: boolean; blockedReason?: string | null } | null;
  steps: VerifiedEditStep[];
};

export async function prepareVerifiedEdit(...args: any[]): Promise<VerifiedEditState> {
  const relativePath = args?.[0]?.relativePath ?? "src/App.tsx";

  return {
    stage: "diff-ready",
    message: "Verified edit prepared.",
    proposal: {
      relativePath,
      diffPreview: "Patch prepared",
      changed: true,
    },
    verification: null,
    checkpoint: null,
    patchResult: null,
    rollback: null,
    steps: [],
  };
}

export async function checkpointVerifiedEdit(..._args: any[]): Promise<VerifiedEditState> {
  return {
    stage: "checkpoint-ready",
    message: "Checkpoint created.",
    proposal: null,
    verification: null,
    checkpoint: { checkpointId: "vivus-checkpoint" },
    patchResult: null,
    rollback: null,
    steps: [],
  };
}

export async function applyAndVerifyEdit(...args: any[]): Promise<VerifiedEditState> {
  const relativePath = args?.[0]?.relativePath ?? "src/App.tsx";

  return {
    stage: "verified",
    message: "Patch applied and verified.",
    proposal: {
      relativePath,
      diffPreview: "Applied patch",
      changed: true,
    },
    verification: { message: "Verification passed." },
    checkpoint: { checkpointId: "vivus-checkpoint" },
    patchResult: { ok: true, blockedReason: null },
    rollback: null,
    steps: [],
  };
}
