import { shouldEscalateRepair } from './repairEscalation';
import { enterExecutionStage } from './executionStageCoordinator';

export function evaluateRepairLoop(
  failedAttempts: number,
) {
  enterExecutionStage(
    'repairing',
    'Evaluating repair loop',
  );

  return shouldEscalateRepair(
    Array.from({ length: failedAttempts }).map(
      (_, index) => ({
        attempt: index + 1,
        success: false,
        summary: 'Repair failed',
      }),
    ),
  );
}
