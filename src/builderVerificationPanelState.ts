export type BuilderVerificationPanelState = {
  projectPath: string;
  isVisible: boolean;
  status: "idle" | "running" | "passed" | "failed" | "blocked";
  title: string;
  message: string;
  sessionId?: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.builderVerificationPanel.v1";

function readState(): BuilderVerificationPanelState[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeState(items: BuilderVerificationPanelState[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {}
}

export function updateBuilderVerificationPanel(
  projectPath: string,
  patch: Partial<BuilderVerificationPanelState>
) {
  const existing = readState();
  const current = existing.find((item) => item.projectPath === projectPath);

  const next: BuilderVerificationPanelState = {
    projectPath,
    isVisible: true,
    status: "idle",
    title: "Verification",
    message: "Waiting for Builder",
    ...(current ?? {}),
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  writeState([
    next,
    ...existing.filter((item) => item.projectPath !== projectPath),
  ]);

  return next;
}

export function getBuilderVerificationPanel(projectPath: string) {
  return readState().find((item) => item.projectPath === projectPath);
}
