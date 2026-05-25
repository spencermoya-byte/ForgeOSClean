import { verifyWorkspaceV1 } from "./workspaceV1Verification";

export type WorkspaceV1CompletionStatus = {
  complete: boolean;
  label: string;
  issues: string[];
};

export function getWorkspaceV1CompletionStatus(): WorkspaceV1CompletionStatus {
  const verification = verifyWorkspaceV1();

  return {
    complete: verification.complete,
    label: verification.complete ? "Workspace V1 complete" : "Workspace V1 needs attention",
    issues: verification.issues,
  };
}

export function installWorkspaceV1CompletionSignal() {
  if (typeof window === "undefined") return;

  (window as Window & {
    __VIVUS_WORKSPACE_V1_COMPLETE__?: boolean;
    __VIVUS_WORKSPACE_V1_STATUS__?: WorkspaceV1CompletionStatus;
  }).__VIVUS_WORKSPACE_V1_STATUS__ = getWorkspaceV1CompletionStatus();

  (window as Window & {
    __VIVUS_WORKSPACE_V1_COMPLETE__?: boolean;
  }).__VIVUS_WORKSPACE_V1_COMPLETE__ = getWorkspaceV1CompletionStatus().complete;
}
