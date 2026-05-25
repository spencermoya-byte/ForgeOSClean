import { getWorkspacePreviewLifecycleState, setWorkspacePreviewLifecycleStatus } from "./workspacePreviewLifecycle";

export type WorkspacePreviewCrashSnapshot = {
  crashed: boolean;
  reason: string;
  checkedAt: string;
};

let lastSnapshot: WorkspacePreviewCrashSnapshot = {
  crashed: false,
  reason: "Preview has not reported a crash.",
  checkedAt: new Date().toISOString(),
};

export function getWorkspacePreviewCrashSnapshot() {
  return lastSnapshot;
}

export function markWorkspacePreviewCrashed(reason = "Preview server stopped unexpectedly.") {
  lastSnapshot = {
    crashed: true,
    reason,
    checkedAt: new Date().toISOString(),
  };

  setWorkspacePreviewLifecycleStatus("failed", reason);

  if (typeof window !== "undefined") {
    (window as Window & {
      __VIVUS_PREVIEW_CRASH__?: WorkspacePreviewCrashSnapshot;
    }).__VIVUS_PREVIEW_CRASH__ = lastSnapshot;

    window.dispatchEvent(new CustomEvent("vivus-preview-crash", { detail: lastSnapshot }));
  }

  return lastSnapshot;
}

export function clearWorkspacePreviewCrash() {
  lastSnapshot = {
    crashed: false,
    reason: "Preview crash state cleared.",
    checkedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    (window as Window & {
      __VIVUS_PREVIEW_CRASH__?: WorkspacePreviewCrashSnapshot;
    }).__VIVUS_PREVIEW_CRASH__ = lastSnapshot;
  }

  return lastSnapshot;
}

export function reconcileWorkspacePreviewCrashState(serverIsRunning: boolean, reason?: string) {
  const lifecycle = getWorkspacePreviewLifecycleState();

  if (serverIsRunning) {
    clearWorkspacePreviewCrash();
    return lastSnapshot;
  }

  if (lifecycle.status === "running" || lifecycle.status === "starting") {
    return markWorkspacePreviewCrashed(reason ?? "Preview server stopped while it was expected to be running.");
  }

  return lastSnapshot;
}
