import { subscribeWorkspaceChanged } from "./workspaceEvents";
import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";

function syncBuilderWorkspaceContext() {
  if (typeof window === "undefined") return;

  const runtime = getWorkspaceOwnedRuntimeStatus();

  (window as Window & {
    __VIVUS_BUILDER_WORKSPACE__?: {
      projectId: string;
      projectName: string;
      rootPath: string;
    };
  }).__VIVUS_BUILDER_WORKSPACE__ = {
    projectId: runtime.activeProjectId,
    projectName: runtime.activeProjectName,
    rootPath: runtime.activeProjectRoot,
  };
}

export function startWorkspaceBuilderRuntimeInstaller() {
  if (typeof window === "undefined") return;

  syncBuilderWorkspaceContext();
  subscribeWorkspaceChanged(syncBuilderWorkspaceContext);
}
