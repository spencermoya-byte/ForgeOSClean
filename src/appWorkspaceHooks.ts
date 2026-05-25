import React from "react";

import { useWorkspaceStore } from "./stores/workspaceStore";
import { workspaceProjectsToAppRecords, workspaceProjectToAppRecord, type AppProjectRecord } from "./workspaceProjectAdapter";

export function useAppWorkspaceProjects() {
  const workspace = useWorkspaceStore();

  const projects = React.useMemo<AppProjectRecord[]>(() => {
    return workspaceProjectsToAppRecords(workspace.projects);
  }, [workspace.projects]);

  const activeProject = React.useMemo<AppProjectRecord | null>(() => {
    return workspace.activeProject ? workspaceProjectToAppRecord(workspace.activeProject) : null;
  }, [workspace.activeProject]);

  return {
    workspace,
    projects,
    activeProject,
    activeProjectId: workspace.activeProject?.id ?? "",
  };
}
