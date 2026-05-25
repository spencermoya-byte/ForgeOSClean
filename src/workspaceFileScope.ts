import { getWorkspaceStatus } from "./workspaceStatus";

export type FileWorkspaceScope = {
  allowed: boolean;
  projectName: string;
  projectPath: string;
  fileOperationsAllowed: boolean;
  blockedReason?: string;
};

export function getFileWorkspaceScope(): FileWorkspaceScope {
  const workspace = getWorkspaceStatus();

  if (!workspace.ready) {
    return {
      allowed: false,
      fileOperationsAllowed: false,
      projectName: "",
      projectPath: "",
      blockedReason: workspace.message,
    };
  }

  return {
    allowed: true,
    fileOperationsAllowed: true,
    projectName: workspace.label,
    projectPath: workspace.rootPath,
  };
}
