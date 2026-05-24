import { getWorkspaceHealth, updateWorkspaceHealth } from "./workspaceHealthState";

export type WorkspaceRouteRecoveryResult = {
  ok: boolean;
  recoveredRoute: string;
  summary: string;
};

const FALLBACK_ROUTE = "workspace";
const MAX_ROUTE_RECOVERY_ATTEMPTS = 3;

export function markWorkspaceRouteHealthy(projectPath: string, route: string) {
  return updateWorkspaceHealth(projectPath, route, {
    status: "healthy",
    lastHealthyAt: new Date().toISOString(),
    failureReason: undefined,
    recoveryAttempts: 0,
  });
}

export function recoverWorkspaceRoute(
  projectPath: string,
  route: string,
  reason: string
): WorkspaceRouteRecoveryResult {
  const current = getWorkspaceHealth(projectPath, route);
  const recoveryAttempts = (current?.recoveryAttempts ?? 0) + 1;
  const recoveredRoute = recoveryAttempts > MAX_ROUTE_RECOVERY_ATTEMPTS ? FALLBACK_ROUTE : route;

  updateWorkspaceHealth(projectPath, route, {
    status: recoveryAttempts > MAX_ROUTE_RECOVERY_ATTEMPTS ? "failed" : "recovering",
    failureReason: reason,
    lastFailureAt: new Date().toISOString(),
    recoveryAttempts,
  });

  if (recoveredRoute !== route) {
    updateWorkspaceHealth(projectPath, recoveredRoute, {
      status: "healthy",
      lastHealthyAt: new Date().toISOString(),
      failureReason: undefined,
      recoveryAttempts: 0,
    });
  }

  return {
    ok: true,
    recoveredRoute,
    summary:
      recoveredRoute === route
        ? `Recovering route ${route} (${recoveryAttempts}/${MAX_ROUTE_RECOVERY_ATTEMPTS}).`
        : `Route ${route} failed repeatedly. Falling back to ${FALLBACK_ROUTE}.`,
  };
}
