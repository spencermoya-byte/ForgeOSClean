import { getWorkspaceSnapshot } from "./stores/workspaceStore";

export function getActiveWorkspaceFilesRoot() {
  const snapshot = getWorkspaceSnapshot();
  return snapshot.activeProject?.rootPath ?? "";
}

export function hasActiveWorkspaceFilesRoot() {
  return getActiveWorkspaceFilesRoot().trim().length > 0;
}
