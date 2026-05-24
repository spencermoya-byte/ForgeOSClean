import { getLivePreviewState } from './livePreviewState';
import { runRuntimeHealthChecks } from './runtimeHealthCoordinator';

export function evaluatePreviewRuntimeHealth() {
  const preview = getLivePreviewState();
  const checks = runRuntimeHealthChecks();

  return {
    preview,
    checks,
    healthy: preview.connected,
  };
}
