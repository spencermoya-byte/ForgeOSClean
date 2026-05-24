export type PreviewDiagnosticSeverity = "info" | "warning" | "error";

export type PreviewDiagnostic = {
  id: string;
  projectPath: string;
  severity: PreviewDiagnosticSeverity;
  category:
    | "blank-screen"
    | "build"
    | "runtime"
    | "recovery"
    | "verification";
  message: string;
  createdAt: string;
};

const STORAGE_KEY = "vivus.previewDiagnostics.v1";
const MAX_ITEMS = 100;

function readDiagnostics(): PreviewDiagnostic[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeDiagnostics(items: PreviewDiagnostic[]) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_ITEMS))
    );
  } catch {}
}

export function addPreviewDiagnostic(
  projectPath: string,
  severity: PreviewDiagnosticSeverity,
  category: PreviewDiagnostic["category"],
  message: string
) {
  const diagnostic: PreviewDiagnostic = {
    id: `preview-diagnostic-${Date.now()}`,
    projectPath,
    severity,
    category,
    message,
    createdAt: new Date().toISOString(),
  };

  writeDiagnostics([diagnostic, ...readDiagnostics()]);
  return diagnostic;
}

export function listPreviewDiagnostics(projectPath: string) {
  return readDiagnostics().filter(
    (item) => item.projectPath === projectPath
  );
}

export function clearPreviewDiagnostics(projectPath: string) {
  writeDiagnostics(
    readDiagnostics().filter(
      (item) => item.projectPath !== projectPath
    )
  );
}
