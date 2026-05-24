import { recoverLivePreview } from './livePreviewRecovery';
import { runRuntimeRepair } from './runtimeRepairCoordinator';

export function runRuntimeRecovery(
  reason: string,
  changedFiles: string[] = [],
) {
  const previewRecovery = recoverLivePreview(
    reason,
  );

  const repairRecovery = runRuntimeRepair(
    1,
    changedFiles,
  );

  return {
    previewRecovery,
    repairRecovery,
  };
}
