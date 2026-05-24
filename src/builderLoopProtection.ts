export type BuilderLoopState = {
  projectPath: string;
  taskHash: string;
  taskPreview: string;
  attempts: number;
  blocked: boolean;
  lastReason?: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.builderLoopProtection.v1";
const MAX_ATTEMPTS = 4;

function readState(): BuilderLoopState[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeState(items: BuilderLoopState[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
  } catch {}
}

function hashTask(task: string) {
  let hash = 0;
  for (let i = 0; i < task.length; i += 1) {
    hash = (hash << 5) - hash + task.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

function previewTask(task: string) {
  const normalized = task.trim().replace(/\s+/g, " ");
  return normalized.length > 140 ? `${normalized.slice(0, 140)}...` : normalized;
}

export function registerBuilderAttempt(projectPath: string, task: string, reason = "builder-run") {
  const taskHash = hashTask(task);
  const existing = readState();
  const current = existing.find(
    (entry) => entry.projectPath === projectPath && entry.taskHash === taskHash
  );

  const attempts = (current?.attempts ?? 0) + 1;
  const next: BuilderLoopState = {
    projectPath,
    taskHash,
    taskPreview: previewTask(task),
    attempts,
    blocked: attempts >= MAX_ATTEMPTS,
    lastReason: reason,
    updatedAt: new Date().toISOString(),
  };

  writeState([
    next,
    ...existing.filter(
      (entry) => !(entry.projectPath === projectPath && entry.taskHash === taskHash)
    ),
  ]);

  return next;
}

export function resetBuilderAttempts(projectPath: string, task: string) {
  const taskHash = hashTask(task);
  writeState(
    readState().filter(
      (entry) => !(entry.projectPath === projectPath && entry.taskHash === taskHash)
    )
  );
}

export function listBuilderLoopStates(projectPath: string) {
  return readState().filter((entry) => entry.projectPath === projectPath);
}

export function getBuilderLoopRisk(projectPath: string, task: string) {
  const taskHash = hashTask(task);
  const state = readState().find((entry) => entry.projectPath === projectPath && entry.taskHash === taskHash);
  const attempts = state?.attempts ?? 0;
  return {
    attempts,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempts),
    blocked: Boolean(state?.blocked),
  };
}
