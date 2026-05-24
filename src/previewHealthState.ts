export type PreviewHealthStatus =
  | "idle"
  | "starting"
  | "healthy"
  | "degraded"
  | "failed"
  | "recovering";

export type PreviewHealthState = {
  projectPath: string;
  status: PreviewHealthStatus;
  url?: string;
  lastHealthyAt?: string;
  lastFailureAt?: string;
  lastRecoveryAt?: string;
  failureReason?: string;
  restartCount: number;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.previewHealth.v1";

function readHealth(): PreviewHealthState[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeHealth(items: PreviewHealthState[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {}
}

export function updatePreviewHealth(
  projectPath: string,
  patch: Partial<PreviewHealthState>
) {
  const existing = readHealth();
  const current = existing.find((item) => item.projectPath === projectPath);

  const next: PreviewHealthState = {
    projectPath,
    status: "idle",
    restartCount: 0,
    ...(current ?? {}),
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  writeHealth([
    next,
    ...existing.filter((item) => item.projectPath !== projectPath),
  ]);

  return next;
}

export function getPreviewHealth(projectPath: string) {
  return readHealth().find((item) => item.projectPath === projectPath);
}
