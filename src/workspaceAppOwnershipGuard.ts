import { subscribeWorkspaceChanged } from "./workspaceEvents";
import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";

function syncOwnershipGuard() {
  if (typeof document === "undefined") return;

  const runtime = getWorkspaceOwnedRuntimeStatus();
  const root = document.documentElement;

  root.dataset.vivusWorkspaceOwned = runtime.workspaceOwned ? "true" : "false";
  root.dataset.vivusProjectId = runtime.activeProjectId;
  root.dataset.vivusProjectName = runtime.activeProjectName;
  root.dataset.vivusProjectCount = String(runtime.projectCount);

  if (runtime.activeProjectRoot) {
    root.dataset.vivusProjectRoot = runtime.activeProjectRoot;
  } else {
    delete root.dataset.vivusProjectRoot;
  }
}

export function startWorkspaceAppOwnershipGuard() {
  if (typeof window === "undefined") return;

  syncOwnershipGuard();
  subscribeWorkspaceChanged(syncOwnershipGuard);
}
