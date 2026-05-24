import { buildPlannerExecutionContext } from './plannerExecutionBridge';
import { buildPatchScope } from './multiFilePatchScope';
import { enterExecutionStage } from './executionStageCoordinator';

export async function prepareExecution(
  request: string,
) {
  enterExecutionStage(
    'planning',
    'Building implementation context',
  );

  const executionContext = buildPlannerExecutionContext(request);

  enterExecutionStage(
    'targeting',
    'Resolving target files',
  );

  const patchScope = buildPatchScope(
    executionContext.targetFiles,
  );

  enterExecutionStage(
    'editing',
    'Preparing edit scope',
  );

  return {
    executionContext,
    patchScope,
  };
}
