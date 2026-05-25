import { getWorkspaceStatus } from "./workspaceStatus";

export type PreviewWorkspaceScope = {
  enabled: boolean;
  projectName: string;
  projectPath: string;
  refreshAllowed: boolean;
  blockedReason?: string;
};

export function getPreviewWorkspaceScope(): PreviewWorkspaceScope {
  const workspace = getWorkspaceStatus();

  if (!workspace.ready) {
    return {
      enabled: false,
      refreshAllowed: false,
      projectName: "",
      projectPath: "",
      blockedReason: workspace.message,
    };
  }

  return {
    enabled: true,
    refreshAllowed: true,
    projectName: workspace.label,
    projectPath: workspace.rootPath,
  };
}
