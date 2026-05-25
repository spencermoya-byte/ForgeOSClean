import { subscribeWorkspaceChanged } from "./workspaceEvents";
import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";

function applyWorkspaceCutover() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const runtime = getWorkspaceOwnedRuntimeStatus();

  const target = window as Window & {
    __VIVUS_WORKSPACE_CUTOVER__?: boolean;
    __VIVUS_APP_STATE_DISABLED__?: boolean;
  };

  const workspaceOwned = runtime.workspaceOwned && runtime.projectCount >= 0;

  target.__VIVUS_WORKSPACE_CUTOVER__ = workspaceOwned;
  target.__VIVUS_APP_STATE_DISABLED__ = workspaceOwned;

  document.documentElement.dataset.vivusWorkspaceCutover = workspaceOwned ? 'true' : 'false';
}

export function startWorkspaceOwnershipCutoverRuntime() {
  if (typeof window === "undefined") return;

  applyWorkspaceCutover();
  subscribeWorkspaceChanged(applyWorkspaceCutover);
}
