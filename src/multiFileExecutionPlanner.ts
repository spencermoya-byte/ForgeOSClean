export type PlannedFileEdit = {
  relativePath: string;
  reason: string;
  priority: number;
};

export type MultiFileExecutionPlan = {
  id: string;
  projectPath: string;
  task: string;
  files: PlannedFileEdit[];
  createdAt: string;
};

const STORAGE_KEY = "vivus.multiFileExecutionPlans.v1";

function readPlans(): MultiFileExecutionPlan[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writePlans(plans: MultiFileExecutionPlan[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {}
}

export function createMultiFileExecutionPlan(
  projectPath: string,
  task: string,
  files: PlannedFileEdit[]
) {
  const plan: MultiFileExecutionPlan = {
    id: `multi-file-plan-${Date.now()}`,
    projectPath,
    task,
    files: [...files].sort((a, b) => b.priority - a.priority),
    createdAt: new Date().toISOString(),
  };

  writePlans([plan, ...readPlans()].slice(0, 100));
  return plan;
}

export function listMultiFileExecutionPlans(projectPath: string) {
  return readPlans().filter(
    (plan) => plan.projectPath === projectPath
  );
}
