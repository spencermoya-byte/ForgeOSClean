import { verifyPreview } from './previewVerificationCoordinator';
import { pushTimelineEvent } from './sessionTimeline';

export async function autoInspectPreview(
  iframe: HTMLIFrameElement | null,
) {
  pushTimelineEvent(
    'verify',
    'Running automatic preview inspection',
  );

  return verifyPreview(iframe);
}
