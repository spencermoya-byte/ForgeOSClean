import { runPlannerRuntime } from './plannerRuntimeBridge';
import { resolveExecutionTargets } from './multiFileExecutionBridge';
import { enterExecutionStage } from './executionStageCoordinator';

export async function prepareRuntimeExecution(
  request: string,
) {
  enterExecutionStage(
    'planning',
    'Preparing runtime execution',
  );

  const planner = await runPlannerRuntime(request);
  const targets = resolveExecutionTargets(request);

  enterExecutionStage(
    'editing',
    `Prepared ${targets.scope.totalFiles} files`,
  );

  return {
    planner,
    targets,
  };
}
