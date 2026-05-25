import { subscribeWorkspaceChanged } from "./workspaceEvents";
import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";

function syncExecutionWorkspaceContext() {
  if (typeof window === "undefined") return;

  const runtime = getWorkspaceOwnedRuntimeStatus();

  (window as Window & {
    __VIVUS_EXECUTION_WORKSPACE__?: {
      projectId: string;
      projectName: string;
      rootPath: string;
    };
  }).__VIVUS_EXECUTION_WORKSPACE__ = {
    projectId: runtime.activeProjectId,
    projectName: runtime.activeProjectName,
    rootPath: runtime.activeProjectRoot,
  };
}

export function startWorkspaceExecutionRuntimeInstaller() {
  if (typeof window === "undefined") return;

  syncExecutionWorkspaceContext();
  subscribeWorkspaceChanged(syncExecutionWorkspaceContext);
}
