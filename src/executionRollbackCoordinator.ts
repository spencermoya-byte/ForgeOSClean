import { createVivusCheckpoint } from './timeMachineRollback';
import { enterExecutionStage } from './executionStageCoordinator';

export function prepareRollback(
  label: string,
  changedFiles: string[],
) {
  enterExecutionStage(
    'rollback',
    'Preparing rollback checkpoint',
  );

  return createVivusCheckpoint(
    label,
    changedFiles,
    {
      rollbackReady: true,
    },
  );
}
