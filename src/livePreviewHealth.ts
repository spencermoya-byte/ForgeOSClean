export type PreviewHealthState = {
  projectPath: string;
  status: "healthy" | "refreshing" | "error" | "offline";
  lastRefreshAt?: string;
  lastError?: string;
  consecutiveFailures: number;
};

const STORAGE_KEY = "vivus.livePreviewHealth.v1";

function readStates(): PreviewHealthState[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStates(states: PreviewHealthState[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  } catch {}
}

export function updatePreviewHealth(
  projectPath: string,
  patch: Partial<PreviewHealthState>
) {
  const existing = readStates();
  const current = existing.find(
    (state) => state.projectPath === projectPath
  );

  const next: PreviewHealthState = {
    projectPath,
    status: "healthy",
    consecutiveFailures: 0,
    ...(current ?? {}),
    ...patch,
  };

  writeStates([
    next,
    ...existing.filter(
      (state) => state.projectPath !== projectPath
    ),
  ]);

  return next;
}

export function getPreviewHealth(projectPath: string) {
  return readStates().find(
    (state) => state.projectPath === projectPath
  );
}
