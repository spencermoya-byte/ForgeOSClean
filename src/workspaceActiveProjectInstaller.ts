import { getWorkspaceSnapshot } from "./stores/workspaceStore";
import { subscribeWorkspaceChanged } from "./workspaceEvents";

const ACTIVE_PROJECT_KEY = "vivus.activeProject.v1";

function syncActiveWorkspaceIntoDom() {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const snapshot = getWorkspaceSnapshot();
  const activeProject = snapshot.activeProject;

  document.documentElement.dataset.vivusWorkspaceId = activeProject?.id ?? "";
  document.documentElement.dataset.vivusWorkspaceName = activeProject?.name ?? "";
  document.documentElement.dataset.vivusWorkspaceRoot = activeProject?.rootPath ?? "";

  if (activeProject) {
    window.localStorage.setItem(ACTIVE_PROJECT_KEY, activeProject.id);
  }
}

export function startWorkspaceActiveProjectInstaller() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const syncSoon = () => window.setTimeout(syncActiveWorkspaceIntoDom, 0);
  syncSoon();
  subscribeWorkspaceChanged(syncSoon);
}
