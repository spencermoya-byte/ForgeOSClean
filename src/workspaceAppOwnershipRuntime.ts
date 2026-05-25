import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";
import { subscribeWorkspaceChanged } from "./workspaceEvents";

function syncAppOwnershipRuntime() {
  if (typeof window === "undefined") return;

  const runtime = getWorkspaceOwnedRuntimeStatus();

  (window as Window & {
    __VIVUS_APP_OWNERSHIP__?: {
      workspaceOwned: boolean;
      activeProjectId: string;
      activeProjectName: string;
      activeProjectRoot: string;
      projectCount: number;
    };
  }).__VIVUS_APP_OWNERSHIP__ = {
    workspaceOwned: true,
    activeProjectId: runtime.activeProjectId,
    activeProjectName: runtime.activeProjectName,
    activeProjectRoot: runtime.activeProjectRoot,
    projectCount: runtime.projectCount,
  };
}

export function startWorkspaceAppOwnershipRuntime() {
  if (typeof window === "undefined") return;

  syncAppOwnershipRuntime();
  subscribeWorkspaceChanged(syncAppOwnershipRuntime);
}
