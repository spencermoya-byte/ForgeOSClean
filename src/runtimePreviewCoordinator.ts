import { connectPreviewPanel } from './previewPanelBridge';
import { autoInspectPreview } from './previewAutoInspector';

export async function initializeRuntimePreview(
  url: string,
  iframe: HTMLIFrameElement | null,
) {
  connectPreviewPanel(url);

  return autoInspectPreview(iframe);
}
