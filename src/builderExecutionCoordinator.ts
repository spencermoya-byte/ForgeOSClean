import { createBuilderExecutionPlan } from "./builderExecutionPlanAdapter";
import { prepareGroupedVerifiedEdits } from "./builderGroupedVerifiedLoop";
import { decomposeBuilderTask, summarizeBuilderTaskDecomposition } from "./builderTaskDecomposer";
import { prepareVerifiedEdit, type VerifiedEditState } from "./vivusExecutionLoop";

export type BuilderExecutionCoordinatorResult = {
  ok: boolean;
  grouped: boolean;
  multiPhase: boolean;
  primary: VerifiedEditState | null;
  prepared: VerifiedEditState[];
  message: string;
};

async function prepareSinglePhase(
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
      multiPhase: false,
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
      multiPhase: false,
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
    multiPhase: false,
    primary: single,
    prepared: [single],
    message: single.message,
  };
}

export async function prepareBuilderExecution(
  projectPath: string,
  userRequest: string,
): Promise<BuilderExecutionCoordinatorResult> {
  const decomposition = decomposeBuilderTask(userRequest);

  if (decomposition.mode === "single-phase") {
    return prepareSinglePhase(projectPath, userRequest);
  }

  const prepared: VerifiedEditState[] = [];
  let primary: VerifiedEditState | null = null;

  for (const phase of decomposition.phases) {
    const result = await prepareSinglePhase(projectPath, phase.prompt);
    if (result.primary && !primary) primary = result.primary;
    prepared.push(...result.prepared);

    if (!result.ok) {
      return {
        ok: false,
        grouped: result.grouped,
        multiPhase: true,
        primary: result.primary ?? primary,
        prepared,
        message: `Task decomposition stopped during phase: ${phase.title}. ${result.message}`,
      };
    }
  }

  return {
    ok: prepared.length > 0,
    grouped: prepared.length > 1,
    multiPhase: true,
    primary,
    prepared,
    message: `Prepared ${prepared.length} edit${prepared.length === 1 ? "" : "s"} across ${decomposition.phases.length} phase${decomposition.phases.length === 1 ? "" : "s"}.\n\n${summarizeBuilderTaskDecomposition(decomposition)}`,
  };
}
