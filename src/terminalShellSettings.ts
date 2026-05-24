export type TerminalShellSettings = {
  projectPath: string;
  defaultMode: "system" | "powershell" | "cmd" | "bash";
  workingDirectory: string;
  restoreLastSession: boolean;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.terminalShellSettings.v1";

function readSettings(): TerminalShellSettings[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSettings(items: TerminalShellSettings[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {}
}

export function ensureTerminalShellSettings(projectPath: string) {
  const existing = readSettings().find((item) => item.projectPath === projectPath);
  if (existing) return existing;

  const now = new Date().toISOString();
  const item: TerminalShellSettings = {
    projectPath,
    defaultMode: "system",
    workingDirectory: projectPath,
    restoreLastSession: true,
    createdAt: now,
    updatedAt: now,
  };

  writeSettings([item, ...readSettings()]);
  return item;
}

export function updateTerminalShellSettings(
  projectPath: string,
  patch: Partial<Omit<TerminalShellSettings, "projectPath" | "createdAt" | "updatedAt">>
) {
  const now = new Date().toISOString();
  const items = readSettings();
  const current = items.find((item) => item.projectPath === projectPath) ?? ensureTerminalShellSettings(projectPath);
  const next: TerminalShellSettings = { ...current, ...patch, updatedAt: now };

  writeSettings([next, ...items.filter((item) => item.projectPath !== projectPath)]);
  return next;
}

export function getTerminalShellSettings(projectPath: string) {
  return ensureTerminalShellSettings(projectPath);
}
