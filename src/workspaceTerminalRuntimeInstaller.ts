import { subscribeWorkspaceChanged } from "./workspaceEvents";
import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";

function syncTerminalWorkspaceContext() {
  if (typeof window === "undefined") return;

  const runtime = getWorkspaceOwnedRuntimeStatus();

  (window as Window & {
    __VIVUS_TERMINAL_WORKSPACE__?: {
      projectId: string;
      projectName: string;
      rootPath: string;
    };
  }).__VIVUS_TERMINAL_WORKSPACE__ = {
    projectId: runtime.activeProjectId,
    projectName: runtime.activeProjectName,
    rootPath: runtime.activeProjectRoot,
  };
}

export function startWorkspaceTerminalRuntimeInstaller() {
  if (typeof window === "undefined") return;

  syncTerminalWorkspaceContext();
  subscribeWorkspaceChanged(syncTerminalWorkspaceContext);
}
