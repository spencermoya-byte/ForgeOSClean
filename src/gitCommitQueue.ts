export type GitCommitItem = {
  id: string;
  projectPath: string;
  title: string;
  description?: string;
  files: string[];
  status: "pending" | "committed" | "failed";
  createdAt: string;
};

const STORAGE_KEY = "vivus.gitCommitQueue.v1";

function readQueue(): GitCommitItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: GitCommitItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.slice(0, 100)));
  } catch {}
}

export function addGitCommitItem(item: Omit<GitCommitItem, "id" | "createdAt">) {
  const next: GitCommitItem = {
    ...item,
    id: `git-commit-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  writeQueue([next, ...readQueue()]);
  return next;
}

export function listGitCommitItems(projectPath: string) {
  return readQueue().filter((item) => item.projectPath === projectPath);
}
