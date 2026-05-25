import React from "react";

import { useAppWorkspaceProjects } from "./appWorkspaceHooks";
import { createWorkspaceFromPath, switchWorkspace } from "./workspaceProjectActions";
import type { AppProjectRecord } from "./workspaceProjectAdapter";

type WorkspaceProjectListProps = {
  onOpenProject: (project: AppProjectRecord) => void;
  renderEmpty: () => React.ReactNode;
  renderProject: (project: AppProjectRecord, openProject: (project: AppProjectRecord) => void) => React.ReactNode;
};

export function WorkspaceProjectList({ onOpenProject, renderEmpty, renderProject }: WorkspaceProjectListProps) {
  const { projects } = useAppWorkspaceProjects();

  if (projects.length === 0) return <>{renderEmpty()}</>;

  return <>{projects.map((project) => renderProject(project, onOpenProject))}</>;
}

export function openWorkspaceProject(project: AppProjectRecord) {
  switchWorkspace(project.id);
  return project;
}

export function createWorkspaceProjectFromPrompt(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) return null;

  const result = createWorkspaceFromPath(trimmed);
  return result.project ? {
    id: result.project.id,
    name: result.project.name,
    originalPrompt: `Workspace root: ${result.project.rootPath}`,
    createdAt: new Date(result.project.createdAt).toISOString(),
    updatedAt: new Date(result.project.updatedAt).toISOString(),
    status: "active" as const,
  } : null;
}
