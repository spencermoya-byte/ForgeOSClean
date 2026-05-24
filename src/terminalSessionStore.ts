export type TerminalHistoryEntry = {
  id: string;
  command: string;
  output: string;
  ok: boolean;
  createdAt: string;
};

export type TerminalSession = {
  id: string;
  projectPath: string;
  name: string;
  history: TerminalHistoryEntry[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.terminalSessions.v1";
const MAX_SESSIONS = 12;
const MAX_HISTORY = 40;

function readSessions(): TerminalSession[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const sessions = raw ? JSON.parse(raw) : [];
    return sessions.map((session: TerminalSession) => ({
      ...session,
      isActive: session.isActive ?? false,
    }));
  } catch {
    return [];
  }
}

function writeSessions(sessions: TerminalSession[]) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sessions.slice(0, MAX_SESSIONS))
    );
  } catch {}
}

export function listTerminalSessions(projectPath: string) {
  return readSessions().filter((session) => session.projectPath === projectPath);
}

export function ensureTerminalSession(projectPath: string) {
  const existing = listTerminalSessions(projectPath).find((session) => session.isActive) ?? listTerminalSessions(projectPath)[0];
  if (existing) return existing;

  const now = new Date().toISOString();
  const session: TerminalSession = {
    id: `terminal-${Date.now()}`,
    projectPath,
    name: "Terminal 1",
    history: [],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  writeSessions([session, ...readSessions()]);
  return session;
}

export function createTerminalSession(projectPath: string) {
  const now = new Date().toISOString();
  const existing = listTerminalSessions(projectPath);
  const session: TerminalSession = {
    id: `terminal-${Date.now()}`,
    projectPath,
    name: `Terminal ${existing.length + 1}`,
    history: [],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  writeSessions([
    session,
    ...readSessions().map((item) =>
      item.projectPath === projectPath ? { ...item, isActive: false } : item
    ),
  ]);

  return session;
}

export function activateTerminalSession(projectPath: string, sessionId: string) {
  const now = new Date().toISOString();
  let active: TerminalSession | null = null;

  writeSessions(
    readSessions().map((session) => {
      if (session.projectPath !== projectPath) return session;
      const next = {
        ...session,
        isActive: session.id === sessionId,
        updatedAt: session.id === sessionId ? now : session.updatedAt,
      };
      if (next.isActive) active = next;
      return next;
    })
  );

  return active ?? ensureTerminalSession(projectPath);
}

export function addTerminalHistory(
  sessionId: string,
  entry: Omit<TerminalHistoryEntry, "id" | "createdAt">
) {
  const now = new Date().toISOString();
  const sessions = readSessions().map((session) => {
    if (session.id !== sessionId) return session;
    return {
      ...session,
      history: [
        {
          ...entry,
          id: `terminal-history-${Date.now()}`,
          createdAt: now,
        },
        ...session.history,
      ].slice(0, MAX_HISTORY),
      updatedAt: now,
    };
  });
  writeSessions(sessions);
}

export function clearTerminalHistory(sessionId: string) {
  const now = new Date().toISOString();
  writeSessions(
    readSessions().map((session) =>
      session.id === sessionId
        ? { ...session, history: [], updatedAt: now }
        : session
    )
  );
}

export function deleteTerminalSession(projectPath: string, sessionId: string) {
  const remaining = readSessions().filter((session) => session.id !== sessionId);
  const projectSessions = remaining.filter((session) => session.projectPath === projectPath);

  if (projectSessions.length && !projectSessions.some((session) => session.isActive)) {
    projectSessions[0].isActive = true;
  }

  writeSessions(remaining);
  return ensureTerminalSession(projectPath);
}
