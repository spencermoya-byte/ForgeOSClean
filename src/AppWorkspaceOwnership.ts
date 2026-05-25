import { useAppWorkspaceState } from "./AppWorkspaceState";
import { activateWorkspaceById } from "./workspaceSwitcherController";
import type { AppProjectRecord } from "./workspaceProjectAdapter";

export function useWorkspaceOwnedProjects() {
  return useAppWorkspaceState();
}

export function openWorkspaceOwnedProject(project: AppProjectRecord) {
  activateWorkspaceById(project.id);
  return project;
}

export function getWorkspaceProjectName(project: AppProjectRecord | null | undefined) {
  return project?.name ?? "Untitled Project";
}
