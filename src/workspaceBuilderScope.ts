import { getWorkspaceStatus } from "./workspaceStatus";

export type BuilderWorkspaceScope = {
  allowed: boolean;
  projectName: string;
  projectPath: string;
  blockedReason?: string;
};

export function getBuilderWorkspaceScope(): BuilderWorkspaceScope {
  const workspace = getWorkspaceStatus();

  if (!workspace.ready) {
    return {
      allowed: false,
      projectName: "",
      projectPath: "",
      blockedReason: workspace.message,
    };
  }

  return {
    allowed: true,
    projectName: workspace.label,
    projectPath: workspace.rootPath,
  };
}
