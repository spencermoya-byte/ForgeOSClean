import { subscribeWorkspaceChanged } from "./workspaceEvents";
import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";

function syncPreviewWorkspaceContext() {
  if (typeof window === "undefined") return;

  const runtime = getWorkspaceOwnedRuntimeStatus();

  (window as Window & {
    __VIVUS_PREVIEW_WORKSPACE__?: {
      projectId: string;
      projectName: string;
      rootPath: string;
    };
  }).__VIVUS_PREVIEW_WORKSPACE__ = {
    projectId: runtime.activeProjectId,
    projectName: runtime.activeProjectName,
    rootPath: runtime.activeProjectRoot,
  };
}

export function startWorkspacePreviewRuntimeInstaller() {
  if (typeof window === "undefined") return;

  syncPreviewWorkspaceContext();
  subscribeWorkspaceChanged(syncPreviewWorkspaceContext);
}
