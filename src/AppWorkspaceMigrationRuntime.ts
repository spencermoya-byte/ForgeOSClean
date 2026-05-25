import { useWorkspaceOwnedProjects } from "./AppWorkspaceOwnership";

export function useAppWorkspaceMigrationRuntime() {
  const workspace = useWorkspaceOwnedProjects();

  return {
    projects: workspace.projects,
    activeProject: workspace.activeProject,
    activeProjectId: workspace.activeProjectId,
    hasProjects: workspace.hasProjects,
    isWorkspaceOwned: true,
  };
}
