import { inspectPreview } from './previewInspection';
import { triggerPreviewRefresh } from './previewRefreshCoordinator';
import { pushWorkspaceDiagnostic } from './workspaceDiagnostics';

export async function verifyPreview(
  iframe: HTMLIFrameElement | null,
) {
  triggerPreviewRefresh();

  const result = await inspectPreview(iframe);

  if (result.shouldRepair) {
    pushWorkspaceDiagnostic(
      'warning',
      'preview',
      result.reason,
    );
  }

  return result;
}
