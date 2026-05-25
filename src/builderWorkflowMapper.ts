import type { BuilderExecutionCoordinatorResult } from "./builderExecutionCoordinator";

export type RuntimeTaskStatus = "queued" | "running" | "done" | "failed";
export type RuntimeActivityStatus = "pending" | "active" | "done" | "blocked";

export type RuntimeTask = {
  id: string;
  title: string;
  status: RuntimeTaskStatus;
};

export type RuntimeActivity = {
  id: string;
  label: string;
  detail: string;
  status: RuntimeActivityStatus;
};

export function mapBuilderExecutionToWorkflow(result: BuilderExecutionCoordinatorResult) {
  const tasks: RuntimeTask[] = [
    {
      id: "task-planning",
      title: result.multiPhase ? "Build execution plan generated" : "Scoped implementation prepared",
      status: "done",
    },
    {
      id: "task-verification",
      title: `Prepared ${result.prepared.length} verified edit${result.prepared.length === 1 ? "" : "s"}`,
      status: result.ok ? "done" : "failed",
    },
    {
      id: "task-approval",
      title: "Ready for approval and execution",
      status: result.ok ? "running" : "queued",
    },
  ];

  const activities: RuntimeActivity[] = [
    {
      id: "activity-coordinator",
      label: "Builder coordinator",
      detail: result.message,
      status: result.ok ? "done" : "blocked",
    },
    {
      id: "activity-runtime",
      label: "Verified edit preparation",
      detail: result.ok
        ? "Real verified edits prepared and ready for approval."
        : "Execution preparation blocked. Review reliability warnings.",
      status: result.ok ? "active" : "blocked",
    },
  ];

  return { tasks, activities };
}
