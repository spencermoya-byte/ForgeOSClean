import { capturePreviewScreenshot } from './visionScreenshotCapture';
import { evaluateVisionRepair } from './visionRepairLoop';

export async function inspectPreview(
  iframe: HTMLIFrameElement | null,
) {
  const snapshot = await capturePreviewScreenshot(iframe);

  return evaluateVisionRepair(
    snapshot.imageBase64 ?? 'No preview snapshot.',
  );
}
