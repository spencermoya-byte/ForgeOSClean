export type BuildDiagnostic = {
  file: string;
  line: number;
  column: number;
  message: string;
  code?: string;
};

let diagnostics: BuildDiagnostic[] = [];

export function setBuildDiagnostics(
  nextDiagnostics: BuildDiagnostic[],
) {
  diagnostics = nextDiagnostics;

  window.dispatchEvent(
    new CustomEvent('vivus-build-diagnostics', {
      detail: diagnostics,
    }),
  );

  return diagnostics;
}

export function getBuildDiagnostics() {
  return diagnostics;
}
