export type BuilderSessionState = {
  projectPath: string;
  lastTask: string;
  lastStatus: string;
  lastChangedFile?: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.builderSession.v1";

function readSessions(): BuilderSessionState[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSessions(entries: BuilderSessionState[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export function getBuilderSession(projectPath: string) {
  return readSessions().find((entry) => entry.projectPath === projectPath) ?? null;
}

export function updateBuilderSession(next: BuilderSessionState) {
  const current = readSessions().filter((entry) => entry.projectPath !== next.projectPath);
  writeSessions([next, ...current]);
}
