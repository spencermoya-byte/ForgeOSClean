import { runVisionExecution } from './visionExecutionBridge';
import { runRuntimeRepair } from './runtimeRepairCoordinator';

export async function runVisionRepairBridge(
  iframe: HTMLIFrameElement | null,
  changedFiles: string[] = [],
) {
  const vision = await runVisionExecution(
    iframe,
  );

  if (vision.shouldRepair) {
    return runRuntimeRepair(1, changedFiles);
  }

  return vision;
}
