import { getBuildStatus } from './buildStatusState';
import { getBuildDiagnostics } from './buildDiagnosticsState';

export function evaluateExecutionRuntimeHealth() {
  const build = getBuildStatus();
  const diagnostics = getBuildDiagnostics();

  return {
    build,
    diagnostics,
    healthy: build.success !== false,
  };
}
