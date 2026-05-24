import { buildPlannerExecutionContext } from './plannerExecutionBridge';
import { enterExecutionStage } from './executionStageCoordinator';

export async function runPlannerRuntime(
  request: string,
) {
  enterExecutionStage(
    'planning',
    'Planner generating implementation strategy',
  );

  const context = buildPlannerExecutionContext(request);

  enterExecutionStage(
    'targeting',
    `Resolved ${context.targetFiles.length} target files`,
  );

  return context;
}
