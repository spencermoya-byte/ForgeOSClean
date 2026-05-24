import { updateBuildStatus } from './buildStatusState';
import { setBuildDiagnostics } from './buildDiagnosticsState';

export function startBuildVerification() {
  updateBuildStatus({
    running: true,
    startedAt: Date.now(),
    success: null,
  });
}

export function finishBuildVerification(
  success: boolean,
  diagnostics = [],
) {
  updateBuildStatus({
    running: false,
    success,
    finishedAt: Date.now(),
    errorCount: diagnostics.length,
  });

  setBuildDiagnostics(diagnostics);
}
