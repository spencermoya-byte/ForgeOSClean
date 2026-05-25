import { useWorkspaceOwnedProjects } from "./AppWorkspaceOwnership";

export function useWorkspaceAppRuntime() {
  const workspace = useWorkspaceOwnedProjects();

  return {
    projects: workspace.projects,
    activeProject: workspace.activeProject,
    activeProjectId: workspace.activeProjectId,
    hasProjects: workspace.hasProjects,
    isWorkspaceOwned: true,
  };
}

export type WorkspaceAppRuntime = ReturnType<typeof useWorkspaceAppRuntime>;
