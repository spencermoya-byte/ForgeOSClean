import { getWorkspaceReadiness } from "./workspaceReadiness";

export type WorkspaceCapabilities = {
  build: "enabled" | "blocked";
  preview: "enabled" | "blocked";
  files: "enabled" | "blocked";
  execution: "enabled" | "blocked";
  rootPath: string;
  blockedReason?: string;
};

export function getWorkspaceCapabilities(): WorkspaceCapabilities {
  const readiness = getWorkspaceReadiness();

  return {
    build: readiness.canBuild ? "enabled" : "blocked",
    preview: readiness.canPreview ? "enabled" : "blocked",
    files: readiness.canInspectFiles ? "enabled" : "blocked",
    execution: readiness.canExecute ? "enabled" : "blocked",
    rootPath: readiness.rootPath,
    blockedReason: readiness.reason,
  };
}
