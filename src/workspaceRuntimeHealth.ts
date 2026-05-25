import { verifyWorkspaceRuntimeReadiness } from "./workspaceRuntimeReadinessVerifier";
import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";

export type WorkspaceRuntimeHealth = {
  healthy: boolean;
  workspaceReady: boolean;
  hasActiveProject: boolean;
  projectCount: number;
  issues: string[];
};

export function getWorkspaceRuntimeHealth(): WorkspaceRuntimeHealth {
  const readiness = verifyWorkspaceRuntimeReadiness();
  const runtime = getWorkspaceOwnedRuntimeStatus();
  const issues = [...readiness.missing];

  if (runtime.projectCount > 0 && !runtime.activeProjectId) {
    issues.push("missing-active-project");
  }

  return {
    healthy: issues.length === 0,
    workspaceReady: readiness.ready,
    hasActiveProject: Boolean(runtime.activeProjectId),
    projectCount: runtime.projectCount,
    issues,
  };
}
