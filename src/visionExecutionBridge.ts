import { inspectPreview } from './previewInspection';
import { enterExecutionStage } from './executionStageCoordinator';

export async function runVisionExecution(
  iframe: HTMLIFrameElement | null,
) {
  enterExecutionStage(
    'verifying',
    'Vision model inspecting preview',
  );

  return inspectPreview(iframe);
}
