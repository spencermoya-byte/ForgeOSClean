export type WorkspaceHealth = {
  projectPath: string;
  status: "healthy" | "warning" | "error";
  issueCount: number;
  lastIssue?: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.workspaceHealth.v1";

function readHealth(): WorkspaceHealth[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeHealth(items: WorkspaceHealth[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {}
}

export function updateWorkspaceHealth(
  projectPath: string,
  patch: Partial<WorkspaceHealth>
) {
  const existing = readHealth();
  const current = existing.find(
    (item) => item.projectPath === projectPath
  );

  const next: WorkspaceHealth = {
    projectPath,
    status: "healthy",
    issueCount: 0,
    ...(current ?? {}),
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  writeHealth([
    next,
    ...existing.filter(
      (item) => item.projectPath !== projectPath
    ),
  ]);

  return next;
}

export function getWorkspaceHealth(projectPath: string) {
  return readHealth().find(
    (item) => item.projectPath === projectPath
  );
}
