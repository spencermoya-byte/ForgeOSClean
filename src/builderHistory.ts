export type BuilderHistoryEntry = {
  id: string;
  projectPath: string;
  task: string;
  status: "running" | "complete" | "blocked" | "rolled-back";
  summary: string;
  changedFile?: string;
  stage?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.builderHistory.v1";
const MAX_ENTRIES = 80;

function readEntries(): BuilderHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: BuilderHistoryEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {}
}

export function listBuilderHistory(projectPath: string) {
  return readEntries().filter((entry) => entry.projectPath === projectPath);
}

export function addBuilderHistory(entry: Omit<BuilderHistoryEntry, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const nextEntry: BuilderHistoryEntry = {
    ...entry,
    id: `builder-history-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };

  writeEntries([nextEntry, ...readEntries()]);
  return nextEntry;
}

export function updateBuilderHistory(id: string, patch: Partial<BuilderHistoryEntry>) {
  const now = new Date().toISOString();
  writeEntries(readEntries().map((entry) => entry.id === id ? { ...entry, ...patch, updatedAt: now } : entry));
}

export function clearBuilderHistory(projectPath: string) {
  writeEntries(readEntries().filter((entry) => entry.projectPath !== projectPath));
}

export function buildBuilderHistoryContext(projectPath: string) {
  const entries = listBuilderHistory(projectPath).slice(0, 8);

  if (!entries.length) return "No prior builder history exists for this project.";

  return entries.map((entry, index) => {
    const file = entry.changedFile ? ` Changed file: ${entry.changedFile}.` : "";
    return `${index + 1}. ${entry.status.toUpperCase()}: ${entry.task}. ${entry.summary}.${file}`;
  }).join("\n");
}
