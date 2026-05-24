import { evaluateRepairLoop } from './repairLoopCoordinator';
import { prepareRollback } from './executionRollbackCoordinator';

export function runRuntimeRepair(
  failedAttempts: number,
  changedFiles: string[],
) {
  const escalation = evaluateRepairLoop(
    failedAttempts,
  );

  if (escalation.shouldRollback) {
    return prepareRollback(
      'runtime-repair-failure',
      changedFiles,
    );
  }

  return escalation;
}
