import { subscribeWorkspaceChanged } from "./workspaceEvents";
import { resetWorkspacePreviewLifecycleForWorkspace } from "./workspacePreviewLifecycle";
import { canRunWorkspacePreview, getWorkspacePreviewRuntimePath } from "./workspacePreviewRuntimePath";

export type WorkspacePreviewRuntimeState = {
  enabled: boolean;
  projectPath: string;
  updatedAt: string;
};

let refreshQueued = false;
let resetQueued = false;

function dispatchCoalescedPreviewRefresh({ resetLifecycle }: { resetLifecycle: boolean }) {
  if (typeof window === "undefined") return;

  resetQueued = resetQueued || resetLifecycle;
  if (refreshQueued) return;

  refreshQueued = true;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (resetQueued) resetWorkspacePreviewLifecycleForWorkspace();
      window.dispatchEvent(new Event("vivus-preview-refresh"));
      refreshQueued = false;
      resetQueued = false;
    });
  });
}

function syncPreviewRuntimeState() {
  if (typeof window === "undefined") return;

  const state: WorkspacePreviewRuntimeState = {
    enabled: canRunWorkspacePreview(),
    projectPath: getWorkspacePreviewRuntimePath(),
    updatedAt: new Date().toISOString(),
  };

  (window as Window & {
    __VIVUS_PREVIEW_WORKSPACE_RUNTIME__?: WorkspacePreviewRuntimeState;
  }).__VIVUS_PREVIEW_WORKSPACE_RUNTIME__ = state;

  dispatchCoalescedPreviewRefresh({ resetLifecycle: true });
}

export function startWorkspacePreviewRuntimeSync() {
  if (typeof window === "undefined") return;

  syncPreviewRuntimeState();
  subscribeWorkspaceChanged(syncPreviewRuntimeState);
}
