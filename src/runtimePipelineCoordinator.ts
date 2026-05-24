import { initializeRuntimeSession } from './runtimeSessionCoordinator';
import { prepareRuntimeExecution } from './runtimeExecutionCoordinator';
import { runRuntimeVerification } from './runtimeVerificationCoordinator';
import { finalizeRuntimeExecution } from './runtimeNotificationCoordinator';

export async function runRuntimePipeline(
  request: string,
  iframe: HTMLIFrameElement | null,
) {
  initializeRuntimeSession();

  const execution = await prepareRuntimeExecution(
    request,
  );

  const confidence = await runRuntimeVerification(
    iframe,
  );

  finalizeRuntimeExecution();

  return {
    execution,
    confidence,
  };
}
