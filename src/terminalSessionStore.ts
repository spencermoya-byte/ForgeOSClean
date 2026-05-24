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
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.terminalSessions.v1";
const MAX_SESSIONS = 12;
const MAX_HISTORY = 40;

function readSessions(): TerminalSession[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: TerminalSession[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch {}
}

export function listTerminalSessions(projectPath: string) {
  return readSessions().filter((session) => session.projectPath === projectPath);
}

export function ensureTerminalSession(projectPath: string) {
  const existing = listTerminalSessions(projectPath)[0];
  if (existing) return existing;

  const now = new Date().toISOString();
  const session: TerminalSession = {
    id: `terminal-${Date.now()}`,
    projectPath,
    name: "Terminal 1",
    history: [],
    createdAt: now,
    updatedAt: now,
  };

  writeSessions([session, ...readSessions()]);
  return session;
}

export function addTerminalHistory(sessionId: string, entry: Omit<TerminalHistoryEntry, "id" | "createdAt">) {
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
  writeSessions(readSessions().map((session) => session.id === sessionId ? { ...session, history: [], updatedAt: now } : session));
}
