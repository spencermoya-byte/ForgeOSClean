import { getWorkspaceStatus } from "./workspaceStatus";

export type ExecutionWorkspaceScope = {
  executable: boolean;
  buildAllowed: boolean;
  terminalAllowed: boolean;
  verificationAllowed: boolean;
  projectName: string;
  projectPath: string;
  blockedReason?: string;
};

export function getExecutionWorkspaceScope(): ExecutionWorkspaceScope {
  const workspace = getWorkspaceStatus();

  if (!workspace.ready) {
    return {
      executable: false,
      buildAllowed: false,
      terminalAllowed: false,
      verificationAllowed: false,
      projectName: "",
      projectPath: "",
      blockedReason: workspace.message,
    };
  }

  return {
    executable: true,
    buildAllowed: true,
    terminalAllowed: true,
    verificationAllowed: true,
    projectName: workspace.label,
    projectPath: workspace.rootPath,
  };
}
