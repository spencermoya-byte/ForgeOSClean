import { useAppWorkspaceProjects } from "./appWorkspaceHooks";

export function useAppWorkspaceState() {
  const workspace = useAppWorkspaceProjects();

  return {
    projects: workspace.projects,
    activeProject: workspace.activeProject,
    activeProjectId: workspace.activeProjectId,
    hasProjects: workspace.projects.length > 0,
  };
}
