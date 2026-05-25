import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";
import { subscribeWorkspaceChanged } from "./workspaceEvents";

export type VivusWorkspaceRuntimeGlobal = ReturnType<typeof getWorkspaceOwnedRuntimeStatus>;

type WorkspaceRuntimeWindow = Window & {
  __VIVUS_WORKSPACE_RUNTIME__?: VivusWorkspaceRuntimeGlobal;
};

function syncWorkspaceRuntimeGlobal() {
  if (typeof window === "undefined") return;
  (window as WorkspaceRuntimeWindow).__VIVUS_WORKSPACE_RUNTIME__ = getWorkspaceOwnedRuntimeStatus();
}

export function startWorkspaceRuntimeGlobals() {
  if (typeof window === "undefined") return;

  syncWorkspaceRuntimeGlobal();
  subscribeWorkspaceChanged(syncWorkspaceRuntimeGlobal);
}
