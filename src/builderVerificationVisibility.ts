export type BuilderVerificationVisibility = {
  projectPath: string;
  currentSessionId?: string;
  status: "idle" | "running" | "passed" | "failed" | "blocked";
  summary?: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.builderVerificationVisibility.v1";

function readItems(): BuilderVerificationVisibility[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeItems(items: BuilderVerificationVisibility[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {}
}

export function updateBuilderVerificationVisibility(
  projectPath: string,
  patch: Partial<BuilderVerificationVisibility>
) {
  const existing = readItems();
  const current = existing.find((x) => x.projectPath === projectPath);

  const next: BuilderVerificationVisibility = {
    projectPath,
    status: "idle",
    ...(current ?? {}),
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  writeItems([
    next,
    ...existing.filter((x) => x.projectPath !== projectPath),
  ]);

  return next;
}

export function getBuilderVerificationVisibility(projectPath: string) {
  return readItems().find((x) => x.projectPath === projectPath);
}
