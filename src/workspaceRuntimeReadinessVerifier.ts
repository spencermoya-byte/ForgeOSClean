import { getWorkspaceCutoverStatus } from "./workspaceCutoverStatus";
import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";

export type WorkspaceRuntimeReadiness = {
  ready: boolean;
  workspaceOwned: boolean;
  cutoverVerified: boolean;
  activeProjectId: string;
  activeProjectRoot: string;
  missing: string[];
};

export function verifyWorkspaceRuntimeReadiness(): WorkspaceRuntimeReadiness {
  const runtime = getWorkspaceOwnedRuntimeStatus();
  const cutover = getWorkspaceCutoverStatus();
  const missing: string[] = [];

  if (!runtime.workspaceOwned) missing.push("workspace-owned-runtime");
  if (!cutover.cutoverEnabled) missing.push("cutover-enabled");
  if (!cutover.appStateDisabled) missing.push("app-state-disabled");
  if (!cutover.workspaceOwned) missing.push("cutover-workspace-owned");

  return {
    ready: missing.length === 0,
    workspaceOwned: runtime.workspaceOwned,
    cutoverVerified: missing.length === 0,
    activeProjectId: runtime.activeProjectId,
    activeProjectRoot: runtime.activeProjectRoot,
    missing,
  };
}
