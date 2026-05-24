import { getVivusHealthChecks } from './vivusHealth';
import { pushWorkspaceDiagnostic } from './workspaceDiagnostics';

export function runRuntimeHealthChecks() {
  const checks = getVivusHealthChecks();

  for (const check of checks) {
    if (!check.healthy) {
      pushWorkspaceDiagnostic(
        'error',
        check.name,
        check.detail,
      );
    }
  }

  return checks;
}
