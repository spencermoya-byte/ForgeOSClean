export type WorkspaceDiagnostic = {
  id: string;
  severity: 'info' | 'warning' | 'error';
  source: string;
  message: string;
  createdAt: number;
};

let diagnostics: WorkspaceDiagnostic[] = [];

export function pushWorkspaceDiagnostic(
  severity: WorkspaceDiagnostic['severity'],
  source: string,
  message: string,
) {
  const diagnostic: WorkspaceDiagnostic = {
    id: `diagnostic-${Date.now()}`,
    severity,
    source,
    message,
    createdAt: Date.now(),
  };

  diagnostics.unshift(diagnostic);

  window.dispatchEvent(
    new CustomEvent('vivus-workspace-diagnostics', {
      detail: diagnostics,
    }),
  );

  return diagnostic;
}

export function getWorkspaceDiagnostics() {
  return diagnostics;
}
