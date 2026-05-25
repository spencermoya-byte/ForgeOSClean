import { getWorkspaceSnapshot } from "./stores/workspaceStore";
import { getWorkspaceCutoverStatus } from "./workspaceCutoverStatus";
import { getWorkspaceRuntimeHealth } from "./workspaceRuntimeHealth";
import { validateWorkspacePath } from "./workspaceValidation";

export type WorkspaceV1Verification = {
  complete: boolean;
  workspaceOwned: boolean;
  cutoverEnabled: boolean;
  runtimeHealthy: boolean;
  hasValidActiveWorkspace: boolean;
  projectCount: number;
  activeProjectId: string;
  activeProjectRoot: string;
  issues: string[];
};

export function verifyWorkspaceV1(): WorkspaceV1Verification {
  const snapshot = getWorkspaceSnapshot();
  const cutover = getWorkspaceCutoverStatus();
  const health = getWorkspaceRuntimeHealth();
  const activeProject = snapshot.activeProject;
  const activeProjectRoot = activeProject?.rootPath ?? "";
  const activePathValidation = activeProjectRoot
    ? validateWorkspacePath(activeProjectRoot)
    : { valid: snapshot.projects.length === 0, reason: "No active workspace root." };

  const issues = [
    ...health.issues,
    ...(cutover.workspaceOwned ? [] : ["workspace-not-owned"]),
    ...(cutover.cutoverEnabled ? [] : ["cutover-not-enabled"]),
    ...(activePathValidation.valid ? [] : [activePathValidation.reason ?? "invalid-active-workspace-root"]),
  ];

  return {
    complete: issues.length === 0,
    workspaceOwned: cutover.workspaceOwned,
    cutoverEnabled: cutover.cutoverEnabled,
    runtimeHealthy: health.healthy,
    hasValidActiveWorkspace: activePathValidation.valid,
    projectCount: snapshot.projects.length,
    activeProjectId: activeProject?.id ?? "",
    activeProjectRoot,
    issues,
  };
}
