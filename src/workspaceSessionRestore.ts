export type WorkspaceSessionSnapshot = {
  projectPath: string;
  route: string;
  activePanels: string[];
  activeFiles: string[];
  selectedWorkspace?: string;
  scrollPosition?: number;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'vivus.workspaceSessions.v1';

function readSessions(): WorkspaceSessionSnapshot[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSessions(items: WorkspaceSessionSnapshot[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {}
}

export function saveWorkspaceSession(snapshot: Omit<WorkspaceSessionSnapshot, 'createdAt' | 'updatedAt'>) {
  const existing = readSessions();
  const now = new Date().toISOString();

  const next: WorkspaceSessionSnapshot = {
    ...snapshot,
    createdAt: now,
    updatedAt: now,
  };

  writeSessions([
    next,
    ...existing.filter((item) => !(item.projectPath === snapshot.projectPath && item.route === snapshot.route)),
  ]);

  return next;
}

export function restoreWorkspaceSession(projectPath: string, route: string) {
  return readSessions().find(
    (item) => item.projectPath === projectPath && item.route === route
  );
}
