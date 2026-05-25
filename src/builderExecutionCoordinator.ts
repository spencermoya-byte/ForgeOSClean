import { createBuilderExecutionPlan } from "./builderExecutionPlanAdapter";
import { prepareGroupedVerifiedEdits } from "./builderGroupedVerifiedLoop";
import { prepareVerifiedEdit, type VerifiedEditState } from "./vivusExecutionLoop";

export type BuilderExecutionCoordinatorResult = {
  ok: boolean;
  grouped: boolean;
  primary: VerifiedEditState | null;
  prepared: VerifiedEditState[];
  message: string;
};

export async function prepareBuilderExecution(
  projectPath: string,
  userRequest: string,
): Promise<BuilderExecutionCoordinatorResult> {
  const executionPlan = await createBuilderExecutionPlan({
    projectPath,
    userRequest,
  });

  if (!executionPlan.ok || !executionPlan.plan) {
    return {
      ok: false,
      grouped: false,
      primary: null,
      prepared: [],
      message: executionPlan.blockedReason ?? "Unable to create Builder execution plan.",
    };
  }

  if (executionPlan.executionGroup?.mode === "group") {
    const grouped = await prepareGroupedVerifiedEdits(
      projectPath,
      executionPlan.planSummary,
      executionPlan.executionGroup,
    );

    return {
      ok: grouped.ok,
      grouped: true,
      primary: grouped.primary,
      prepared: grouped.prepared,
      message: grouped.message,
    };
  }

  const single = await prepareVerifiedEdit({
    projectPath,
    relativePath: executionPlan.selectedRelativePath ?? undefined,
    planSummary: executionPlan.planSummary,
  });

  return {
    ok: single.stage === "diff-ready",
    grouped: false,
    primary: single,
    prepared: [single],
    message: single.message,
  };
}
