import { getWorkspaceSnapshot, getActiveWorkspaceRootPath } from "./stores/workspaceStore";

export function getWorkspaceProjects() {
  return getWorkspaceSnapshot().projects;
}

export function getCurrentWorkspaceProject() {
  const snapshot = getWorkspaceSnapshot();
  const active = snapshot.activeProject;

  // Recovery fallback: if active workspace exists visually
  // but rootPath failed to hydrate, reconstruct it.
  if (active && (!active.rootPath || !active.rootPath.trim())) {
    const recoveredPath = getActiveWorkspaceRootPath();

    if (recoveredPath) {
      return {
        ...active,
        rootPath: recoveredPath,
      };
    }
  }

  return active;
}

export function hasActiveWorkspace() {
  const workspace = getCurrentWorkspaceProject();
  return Boolean(workspace?.rootPath?.trim());
}
