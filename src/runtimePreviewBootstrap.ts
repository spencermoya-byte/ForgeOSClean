import { initializeRuntimePreview } from './runtimePreviewCoordinator';
import { getLivePreviewState } from './livePreviewState';

export async function bootstrapPreviewRuntime(
  iframe: HTMLIFrameElement | null,
) {
  const preview = getLivePreviewState();

  if (!preview.url) {
    return null;
  }

  return initializeRuntimePreview(
    preview.url,
    iframe,
  );
}
