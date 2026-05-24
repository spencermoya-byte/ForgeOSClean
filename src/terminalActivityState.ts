export type TerminalActivityStatus = "idle" | "busy" | "complete" | "error" | "stopped";

export type TerminalActivityState = {
  id: string;
  sessionId: string;
  projectPath: string;
  label: string;
  command: string;
  status: TerminalActivityStatus;
  startedAt: string;
  endedAt?: string;
  exitCode?: number | null;
  durationMs?: number;
  outputPreview?: string;
};

const STORAGE_KEY = "vivus.terminalActivities.v1";
const MAX_ITEMS = 120;

function readItems(): TerminalActivityState[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeItems(items: TerminalActivityState[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {}
}

export function startTerminalActivity(sessionId: string, projectPath: string, label: string, command: string) {
  const item: TerminalActivityState = {
    id: `terminal-activity-${Date.now()}`,
    sessionId,
    projectPath,
    label,
    command,
    status: "busy",
    startedAt: new Date().toISOString(),
  };

  writeItems([item, ...readItems()]);
  return item;
}

export function finishTerminalActivity(activityId: string, patch: Pick<TerminalActivityState, "status"> & Partial<TerminalActivityState>) {
  const endedAt = new Date().toISOString();
  writeItems(
    readItems().map((item) =>
      item.id === activityId
        ? {
            ...item,
            ...patch,
            endedAt,
          }
        : item
    )
  );
}

export function listTerminalActivities(projectPath: string) {
  return readItems().filter((item) => item.projectPath === projectPath);
}

export function listSessionActivities(sessionId: string) {
  return readItems().filter((item) => item.sessionId === sessionId);
}

export function getBusyTerminalActivity(sessionId: string) {
  return readItems().find((item) => item.sessionId === sessionId && item.status === "busy");
}
