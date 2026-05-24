import { getPreviewHealth, updatePreviewHealth } from "./livePreviewHealth";

const MAX_FAILURES = 3;

export function registerPreviewFailure(projectPath: string, error: string) {
  const current = getPreviewHealth(projectPath);
  const failures = (current?.consecutiveFailures ?? 0) + 1;

  return updatePreviewHealth(projectPath, {
    status: failures >= MAX_FAILURES ? "error" : "refreshing",
    consecutiveFailures: failures,
    lastError: error,
  });
}

export function registerPreviewRecovery(projectPath: string) {
  return updatePreviewHealth(projectPath, {
    status: "healthy",
    consecutiveFailures: 0,
    lastRefreshAt: new Date().toISOString(),
    lastError: undefined,
  });
}
