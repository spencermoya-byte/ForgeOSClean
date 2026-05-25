import { getWorkspaceSnapshot } from "./stores/workspaceStore";

export function getWorkspaceProjects() {
  return getWorkspaceSnapshot().projects;
}

export function getCurrentWorkspaceProject() {
  return getWorkspaceSnapshot().activeProject;
}

export function hasActiveWorkspace() {
  return Boolean(getCurrentWorkspaceProject());
}
