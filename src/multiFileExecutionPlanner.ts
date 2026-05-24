export type PlannedFileEdit = {
  relativePath: string;
  reason: string;
  priority: number;
  status: "planned" | "prepared" | "approved" | "applied" | "verified" | "blocked";
  diffPreview?: string;
  updatedAt?: string;
};

export type MultiFileExecutionPlan = {
  id: string;
  projectPath: string;
  task: string;
  files: PlannedFileEdit[];
  status: "planned" | "preparing" | "approval-ready" | "applying" | "verified" | "blocked";
  summary?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.multiFileExecutionPlans.v1";
const MAX_PLANS = 100;

function readPlans(): MultiFileExecutionPlan[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const plans = raw ? JSON.parse(raw) : [];
    return plans.map((plan: MultiFileExecutionPlan) => ({
      ...plan,
      status: plan.status ?? "planned",
      updatedAt: plan.updatedAt ?? plan.createdAt,
      files: plan.files.map((file) => ({
        ...file,
        status: file.status ?? "planned",
      })),
    }));
  } catch {
    return [];
  }
}

function writePlans(plans: MultiFileExecutionPlan[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans.slice(0, MAX_PLANS)));
  } catch {}
}

export function createMultiFileExecutionPlan(
  projectPath: string,
  task: string,
  files: Array<Omit<PlannedFileEdit, "status"> & Partial<Pick<PlannedFileEdit, "status">>>
) {
  const now = new Date().toISOString();
  const plan: MultiFileExecutionPlan = {
    id: `multi-file-plan-${Date.now()}`,
    projectPath,
    task,
    files: [...files]
      .sort((a, b) => b.priority - a.priority)
      .map((file) => ({ ...file, status: file.status ?? "planned", updatedAt: now })),
    status: "planned",
    summary: "Multi-file plan created.",
    createdAt: now,
    updatedAt: now,
  };

  writePlans([plan, ...readPlans()]);
  return plan;
}

export function updateMultiFileExecutionPlan(
  planId: string,
  patch: Partial<Omit<MultiFileExecutionPlan, "id" | "createdAt">>
) {
  const now = new Date().toISOString();
  writePlans(
    readPlans().map((plan) =>
      plan.id === planId
        ? {
            ...plan,
            ...patch,
            updatedAt: now,
          }
        : plan
    )
  );
}

export function updatePlannedFileEdit(
  planId: string,
  relativePath: string,
  patch: Partial<PlannedFileEdit>
) {
  const now = new Date().toISOString();
  writePlans(
    readPlans().map((plan) =>
      plan.id === planId
        ? {
            ...plan,
            files: plan.files.map((file) =>
              file.relativePath === relativePath
                ? { ...file, ...patch, updatedAt: now }
                : file
            ),
            updatedAt: now,
          }
        : plan
    )
  );
}

export function getMultiFileExecutionPlan(planId: string) {
  return readPlans().find((plan) => plan.id === planId);
}

export function listMultiFileExecutionPlans(projectPath: string) {
  return readPlans().filter((plan) => plan.projectPath === projectPath);
}
