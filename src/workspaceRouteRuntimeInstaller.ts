import { subscribeWorkspaceChanged } from "./workspaceEvents";
import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";

function syncWorkspaceRoutes() {
  if (typeof window === "undefined") return;

  const runtime = getWorkspaceOwnedRuntimeStatus();
  const currentHash = window.location.hash || "#/";

  if (!runtime.activeProjectId) {
    if (currentHash.includes("workspace")) {
      window.location.hash = "/";
    }
    return;
  }

  const inWorkspace = currentHash.includes("workspace");
  if (!inWorkspace && runtime.projectCount > 0) {
    document.documentElement.dataset.vivusWorkspaceReady = "true";
  }
}

export function startWorkspaceRouteRuntimeInstaller() {
  if (typeof window === "undefined") return;

  syncWorkspaceRoutes();
  subscribeWorkspaceChanged(syncWorkspaceRoutes);
  window.addEventListener("hashchange", syncWorkspaceRoutes);
}
