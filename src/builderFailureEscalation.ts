export type BuilderEscalation = {
  id: string;
  projectPath: string;
  task: string;
  severity: "warning" | "high" | "critical";
  reason: string;
  recommendedAction: string;
  createdAt: string;
};

const STORAGE_KEY = "vivus.builderEscalations.v1";

function readEscalations(): BuilderEscalation[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeEscalations(items: BuilderEscalation[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
  } catch {}
}

export function createBuilderEscalation(
  projectPath: string,
  task: string,
  reason: string,
  severity: BuilderEscalation["severity"] = "warning"
) {
  const escalation: BuilderEscalation = {
    id: `builder-escalation-${Date.now()}`,
    projectPath,
    task,
    severity,
    reason,
    recommendedAction:
      severity === "critical"
        ? "Manual review required before retrying."
        : "Review logs and retry with narrower scope.",
    createdAt: new Date().toISOString(),
  };

  writeEscalations([escalation, ...readEscalations()]);
  return escalation;
}

export function listBuilderEscalations(projectPath: string) {
  return readEscalations().filter(
    (item) => item.projectPath === projectPath
  );
}
