import { subscribeWorkspaceChanged } from "./workspaceEvents";
import { resetWorkspacePreviewLifecycleForWorkspace } from "./workspacePreviewLifecycle";
import { canRunWorkspacePreview, getWorkspacePreviewRuntimePath } from "./workspacePreviewRuntimePath";

export type WorkspacePreviewRuntimeState = {
  enabled: boolean;
  projectPath: string;
  updatedAt: string;
};

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

  resetWorkspacePreviewLifecycleForWorkspace();
  window.dispatchEvent(new Event("vivus-preview-refresh"));
}

export function startWorkspacePreviewRuntimeSync() {
  if (typeof window === "undefined") return;

  syncPreviewRuntimeState();
  subscribeWorkspaceChanged(syncPreviewRuntimeState);
}
