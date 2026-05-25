import { createBuilderExecutionPlan } from "./builderExecutionPlanAdapter";
import { prepareGroupedVerifiedEdits } from "./builderGroupedVerifiedLoop";
import { assessBuilderPatchReliability, type BuilderReliabilityResult } from "./builderPatchReliability";
import { decomposeBuilderTask, summarizeBuilderTaskDecomposition } from "./builderTaskDecomposer";
import { prepareVerifiedEdit, type VerifiedEditState } from "./vivusExecutionLoop";

export type BuilderExecutionCoordinatorResult = {
  ok: boolean;
  grouped: boolean;
  multiPhase: boolean;
  primary: VerifiedEditState | null;
  prepared: VerifiedEditState[];
  reliability: BuilderReliabilityResult[];
  message: string;
};

function assessPrepared(prepared: VerifiedEditState[]) {
  return prepared.map((state) => assessBuilderPatchReliability(state));
}

function allReliable(reliability: BuilderReliabilityResult[]) {
  return reliability.length > 0 && reliability.every((result) => result.safe);
}

function reliabilitySummary(reliability: BuilderReliabilityResult[]) {
  if (!reliability.length) return "No reliability results available.";
  const average = reliability.reduce((sum, item) => sum + item.confidence, 0) / reliability.length;
  const unsafe = reliability.filter((item) => !item.safe).length;
  return `Reliability: ${(average * 100).toFixed(0)}% average confidence. ${unsafe} unsafe edit${unsafe === 1 ? "" : "s"}.`;
}

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
      reliability: [],
      message: executionPlan.blockedReason ?? "Unable to create Builder execution plan.",
    };
  }

  if (executionPlan.executionGroup?.mode === "group") {
    const grouped = await prepareGroupedVerifiedEdits(
      projectPath,
      executionPlan.planSummary,
      executionPlan.executionGroup,
    );
    const reliability = assessPrepared(grouped.prepared);

    return {
      ok: grouped.ok && allReliable(reliability),
      grouped: true,
      multiPhase: false,
      primary: grouped.primary,
      prepared: grouped.prepared,
      reliability,
      message: `${grouped.message}\n${reliabilitySummary(reliability)}`,
    };
  }

  const single = await prepareVerifiedEdit({
    projectPath,
    relativePath: executionPlan.selectedRelativePath ?? undefined,
    planSummary: executionPlan.planSummary,
  });
  const reliability = assessPrepared([single]);

  return {
    ok: single.stage === "diff-ready" && allReliable(reliability),
    grouped: false,
    multiPhase: false,
    primary: single,
    prepared: [single],
    reliability,
    message: `${single.message}\n${reliabilitySummary(reliability)}`,
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
  const reliability: BuilderReliabilityResult[] = [];
  let primary: VerifiedEditState | null = null;

  for (const phase of decomposition.phases) {
    const result = await prepareSinglePhase(projectPath, phase.prompt);
    if (result.primary && !primary) primary = result.primary;
    prepared.push(...result.prepared);
    reliability.push(...result.reliability);

    if (!result.ok) {
      return {
        ok: false,
        grouped: result.grouped,
        multiPhase: true,
        primary: result.primary ?? primary,
        prepared,
        reliability,
        message: `Task decomposition stopped during phase: ${phase.title}. ${result.message}`,
      };
    }
  }

  return {
    ok: prepared.length > 0 && allReliable(reliability),
    grouped: prepared.length > 1,
    multiPhase: true,
    primary,
    prepared,
    reliability,
    message: `Prepared ${prepared.length} edit${prepared.length === 1 ? "" : "s"} across ${decomposition.phases.length} phase${decomposition.phases.length === 1 ? "" : "s"}.\n${reliabilitySummary(reliability)}\n\n${summarizeBuilderTaskDecomposition(decomposition)}`,
  };
}
