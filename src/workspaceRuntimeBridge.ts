import { getWorkspaceSnapshot } from "./stores/workspaceStore";
import {
  emitWorkspaceChanged,
  emitWorkspaceRefresh,
  VIVUS_WORKSPACE_CHANGED,
} from "./workspaceEvents";
import { workspaceProjectsToAppRecords } from "./workspaceProjectAdapter";

const ACTIVE_PROJECT_KEY = "vivus.activeProject.v1";
const PROJECTS_KEY = "vivus.projects.v1";

function dispatchWorkspaceRefresh() {
  emitWorkspaceRefresh();
  emitWorkspaceChanged(getWorkspaceSnapshot());
}

function syncLegacyAppStateFromWorkspace() {
  if (typeof window === "undefined") return;

  const snapshot = getWorkspaceSnapshot();
  const legacyProjects = workspaceProjectsToAppRecords(snapshot.projects);

  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(legacyProjects));

  if (snapshot.activeProject) {
    window.localStorage.setItem(ACTIVE_PROJECT_KEY, snapshot.activeProject.id);
  } else {
    window.localStorage.removeItem(ACTIVE_PROJECT_KEY);
  }
}

export function startWorkspaceRuntimeBridge() {
  if (typeof window === "undefined") return;

  const refresh = () => {
    syncLegacyAppStateFromWorkspace();
    dispatchWorkspaceRefresh();
  };

  refresh();
  window.addEventListener("storage", refresh);
  window.addEventListener(VIVUS_WORKSPACE_CHANGED, syncLegacyAppStateFromWorkspace);
}
