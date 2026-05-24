export type BuilderApprovalStatus = "pending" | "approved" | "rejected" | "applied" | "rolled-back";

export type BuilderApprovalItem = {
  id: string;
  projectPath: string;
  task: string;
  relativePath: string;
  diffPreview: string;
  status: BuilderApprovalStatus;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.builderApprovalQueue.v1";

function readQueue(): BuilderApprovalItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: BuilderApprovalItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function listBuilderApprovals(projectPath: string) {
  return readQueue().filter((item) => item.projectPath === projectPath);
}

export function addBuilderApproval(item: Omit<BuilderApprovalItem, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const next = {
    ...item,
    id: `approval-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };

  writeQueue([next, ...readQueue()]);
  return next;
}

export function updateBuilderApproval(id: string, patch: Partial<BuilderApprovalItem>) {
  const now = new Date().toISOString();
  writeQueue(
    readQueue().map((item) =>
      item.id === id ? { ...item, ...patch, updatedAt: now } : item
    )
  );
}
