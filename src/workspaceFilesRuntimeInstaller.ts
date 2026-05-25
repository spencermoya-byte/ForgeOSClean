import { subscribeWorkspaceChanged } from "./workspaceEvents";
import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";

function syncFilesWorkspaceContext() {
  if (typeof window === "undefined") return;

  const runtime = getWorkspaceOwnedRuntimeStatus();

  (window as Window & {
    __VIVUS_FILES_WORKSPACE__?: {
      projectId: string;
      projectName: string;
      rootPath: string;
    };
  }).__VIVUS_FILES_WORKSPACE__ = {
    projectId: runtime.activeProjectId,
    projectName: runtime.activeProjectName,
    rootPath: runtime.activeProjectRoot,
  };
}

export function startWorkspaceFilesRuntimeInstaller() {
  if (typeof window === "undefined") return;

  syncFilesWorkspaceContext();
  subscribeWorkspaceChanged(syncFilesWorkspaceContext);
}
