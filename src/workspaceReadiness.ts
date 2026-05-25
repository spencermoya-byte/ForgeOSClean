import { getWorkspaceStatus } from "./workspaceStatus";

export type WorkspaceReadiness = {
  canBuild: boolean;
  canPreview: boolean;
  canInspectFiles: boolean;
  canExecute: boolean;
  rootPath: string;
  reason?: string;
};

export function getWorkspaceReadiness(): WorkspaceReadiness {
  const status = getWorkspaceStatus();

  if (!status.ready) {
    return {
      canBuild: false,
      canPreview: false,
      canInspectFiles: false,
      canExecute: false,
      rootPath: "",
      reason: status.message,
    };
  }

  return {
    canBuild: true,
    canPreview: true,
    canInspectFiles: true,
    canExecute: true,
    rootPath: status.rootPath,
  };
}
