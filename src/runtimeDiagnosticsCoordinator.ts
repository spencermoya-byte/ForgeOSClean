import { getWorkspaceDiagnostics } from './workspaceDiagnostics';
import { getBuildDiagnostics } from './buildDiagnosticsState';

export function initializeDiagnosticsRuntime() {
  return {
    workspace: getWorkspaceDiagnostics(),
    build: getBuildDiagnostics(),
  };
}
