import { getWorkspaceSnapshot } from "./stores/workspaceStore";

export type WorkspaceOwnedRuntimeStatus = {
  workspaceOwned: true;
  activeProjectId: string;
  activeProjectName: string;
  activeProjectRoot: string;
  projectCount: number;
};

export function getWorkspaceOwnedRuntimeStatus(): WorkspaceOwnedRuntimeStatus {
  const snapshot = getWorkspaceSnapshot();
  const activeProject = snapshot.activeProject;

  return {
    workspaceOwned: true,
    activeProjectId: activeProject?.id ?? "",
    activeProjectName: activeProject?.name ?? "",
    activeProjectRoot: activeProject?.rootPath ?? "",
    projectCount: snapshot.projects.length,
  };
}
