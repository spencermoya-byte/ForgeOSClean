export type BuilderLoopState = {
  projectPath: string;
  taskHash: string;
  attempts: number;
  blocked: boolean;
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

export function registerBuilderAttempt(projectPath: string, task: string) {
  const taskHash = hashTask(task);
  const existing = readState();
  const current = existing.find(
    (entry) => entry.projectPath === projectPath && entry.taskHash === taskHash
  );

  const attempts = (current?.attempts ?? 0) + 1;
  const next: BuilderLoopState = {
    projectPath,
    taskHash,
    attempts,
    blocked: attempts >= MAX_ATTEMPTS,
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
