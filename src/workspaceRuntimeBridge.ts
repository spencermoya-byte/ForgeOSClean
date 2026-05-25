import { getWorkspaceSnapshot } from "./stores/workspaceStore";
import {
  emitWorkspaceChanged,
  emitWorkspaceRefresh,
  VIVUS_WORKSPACE_CHANGED,
} from "./workspaceEvents";

const ACTIVE_PROJECT_KEY = "vivus.activeProject.v1";
const PROJECTS_KEY = "vivus.projects.v1";

function dispatchWorkspaceRefresh() {
  emitWorkspaceRefresh();
  emitWorkspaceChanged(getWorkspaceSnapshot());
}

function syncLegacyActiveProjectToRegistry() {
  if (typeof window === "undefined") return;

  const snapshot = getWorkspaceSnapshot();
  const activeProject = snapshot.activeProject;
  if (!activeProject) return;

  window.localStorage.setItem(ACTIVE_PROJECT_KEY, activeProject.id);

  try {
    const existing = JSON.parse(window.localStorage.getItem(PROJECTS_KEY) ?? "[]") as Array<Record<string, unknown>>;
    const alreadyExists = existing.some((project) => project.id === activeProject.id);
    if (alreadyExists) return;

    const now = new Date(activeProject.updatedAt || Date.now()).toISOString();
    const bridgedProject = {
      id: activeProject.id,
      name: activeProject.name,
      originalPrompt: `Workspace root: ${activeProject.rootPath}`,
      createdAt: new Date(activeProject.createdAt || Date.now()).toISOString(),
      updatedAt: now,
      status: "active",
    };

    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify([bridgedProject, ...existing]));
  } catch {
    // Registry remains source of truth.
  }
}

export function startWorkspaceRuntimeBridge() {
  if (typeof window === "undefined") return;

  const refresh = () => {
    syncLegacyActiveProjectToRegistry();
    dispatchWorkspaceRefresh();
  };

  refresh();
  window.addEventListener("storage", refresh);
  window.addEventListener(VIVUS_WORKSPACE_CHANGED, syncLegacyActiveProjectToRegistry);
}
