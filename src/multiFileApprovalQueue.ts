export type MultiFileApprovalItem = {
  id: string;
  planId: string;
  projectPath: string;
  relativePath: string;
  diffPreview?: string;
  status: "pending" | "approved" | "rejected" | "applied";
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.multiFileApprovalQueue.v1";

function readQueue(): MultiFileApprovalItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: MultiFileApprovalItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 300)));
  } catch {}
}

export function addMultiFileApproval(
  planId: string,
  projectPath: string,
  relativePath: string,
  diffPreview?: string
) {
  const now = new Date().toISOString();

  const item: MultiFileApprovalItem = {
    id: `multi-file-approval-${Date.now()}`,
    planId,
    projectPath,
    relativePath,
    diffPreview,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  writeQueue([item, ...readQueue()]);
  return item;
}

export function updateMultiFileApproval(
  approvalId: string,
  patch: Partial<MultiFileApprovalItem>
) {
  const now = new Date().toISOString();

  writeQueue(
    readQueue().map((item) =>
      item.id === approvalId
        ? { ...item, ...patch, updatedAt: now }
        : item
    )
  );
}

export function listMultiFileApprovals(projectPath: string) {
  return readQueue().filter(
    (item) => item.projectPath === projectPath
  );
}

export function getApprovalsForPlan(planId: string) {
  return readQueue().filter((item) => item.planId === planId);
}
