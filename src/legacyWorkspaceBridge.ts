import { createWorkspaceFromPath, switchWorkspace } from "./workspaceProjectActions";
import { projectRootFromPrompt } from "./workspaceProjectAdapter";

const ACTIVE_PROJECT_KEY = "vivus.activeProject.v1";
const PROJECTS_KEY = "vivus.projects.v1";

function readLegacyProjects(): Array<{ id?: string; name?: string; originalPrompt?: string }> {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function syncLegacyActiveProject() {
  if (typeof window === "undefined") return;

  const activeProjectId = window.localStorage.getItem(ACTIVE_PROJECT_KEY)?.trim();
  if (!activeProjectId) return;

  if (switchWorkspace(activeProjectId).ok) return;

  const legacyProject = readLegacyProjects().find((project) => project.id === activeProjectId);
  if (!legacyProject) return;

  const rootPath = projectRootFromPrompt(legacyProject.originalPrompt ?? "");
  if (!rootPath) return;

  createWorkspaceFromPath(rootPath, legacyProject.name);
}

export function startLegacyWorkspaceBridge() {
  if (typeof window === "undefined") return;

  const originalSetItem = window.localStorage.setItem.bind(window.localStorage);

  window.localStorage.setItem = (key: string, value: string) => {
    originalSetItem(key, value);
    if (key === ACTIVE_PROJECT_KEY || key === PROJECTS_KEY) {
      window.queueMicrotask(syncLegacyActiveProject);
    }
  };

  syncLegacyActiveProject();
}
