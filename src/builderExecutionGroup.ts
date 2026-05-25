import type { BuilderImplementationPlan } from "./builderImplementationPlan";
import { createBuilderFileSet } from "./builderFileSet";

export type BuilderExecutionGroupStep = {
  relativePath: string;
  role: "main" | "related";
  execute: boolean;
  reason: string;
};

export type BuilderExecutionGroup = {
  mode: "single" | "group";
  primaryTarget: string | null;
  executionOrder: BuilderExecutionGroupStep[];
  summary: string;
};

export function createBuilderExecutionGroup(plan: BuilderImplementationPlan): BuilderExecutionGroup {
  const fileSet = createBuilderFileSet(plan);

  const executionOrder: BuilderExecutionGroupStep[] = fileSet.files.map((file, index) => ({
    relativePath: file.relativePath,
    role: file.kind,
    execute: index === 0 || fileSet.mode === "group",
    reason: file.reason,
  }));

  const primaryTarget = fileSet.mainFile?.relativePath ?? null;

  const summary = executionOrder.length
    ? executionOrder
        .map((step, index) => `${index + 1}. ${step.relativePath} (${step.role}) — ${step.reason}`)
        .join("\n")
    : "No execution targets available.";

  return {
    mode: fileSet.mode,
    primaryTarget,
    executionOrder,
    summary,
  };
}
