export type WorkspaceHealthStatus =
  | "healthy"
  | "degraded"
  | "recovering"
  | "failed";

export type WorkspaceHealth = {
  projectPath: string;
  route: string;
  status: WorkspaceHealthStatus;
  lastHealthyAt?: string;
  lastFailureAt?: string;
  failureReason?: string;
  recoveryAttempts: number;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.workspaceHealth.v1";

function readWorkspaceHealth(): WorkspaceHealth[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeWorkspaceHealth(items: WorkspaceHealth[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {}
}

export function updateWorkspaceHealth(
  projectPath: string,
  route: string,
  patch: Partial<WorkspaceHealth>
) {
  const items = readWorkspaceHealth();
  const current = items.find(
    (item) => item.projectPath === projectPath && item.route === route
  );

  const next: WorkspaceHealth = {
    projectPath,
    route,
    status: "healthy",
    recoveryAttempts: 0,
    ...(current ?? {}),
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  writeWorkspaceHealth([
    next,
    ...items.filter(
      (item) =>
        !(item.projectPath === projectPath && item.route === route)
    ),
  ]);

  return next;
}

export function getWorkspaceHealth(projectPath: string, route: string) {
  return readWorkspaceHealth().find(
    (item) => item.projectPath === projectPath && item.route === route
  );
}
