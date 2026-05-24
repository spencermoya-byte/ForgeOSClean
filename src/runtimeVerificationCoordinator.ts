import { startBuildVerification, finishBuildVerification } from './buildVerificationBridge';
import { runVisionExecution } from './visionExecutionBridge';
import { finalizeExecutionDecision } from './verificationDecisionEngine';

export async function runRuntimeVerification(
  iframe: HTMLIFrameElement | null,
) {
  startBuildVerification();

  const vision = await runVisionExecution(iframe);

  finishBuildVerification(
    !vision.shouldRepair,
    [],
  );

  return finalizeExecutionDecision(
    !vision.shouldRepair,
    vision.shouldRepair,
    1,
  );
}
