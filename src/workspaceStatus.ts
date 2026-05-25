import { getCurrentWorkspaceProject, hasActiveWorkspace } from "./workspaceSelectors";
import { NO_ACTIVE_WORKSPACE_MESSAGE } from "./workspacePathGuards";

export type WorkspaceStatus = {
  ready: boolean;
  label: string;
  rootPath: string;
  message: string;
};

export function getWorkspaceStatus(): WorkspaceStatus {
  const project = getCurrentWorkspaceProject();

  if (!hasActiveWorkspace() || !project) {
    return {
      ready: false,
      label: "No workspace",
      rootPath: "",
      message: NO_ACTIVE_WORKSPACE_MESSAGE,
    };
  }

  return {
    ready: true,
    label: project.name,
    rootPath: project.rootPath,
    message: `${project.name} is active.`,
  };
}
