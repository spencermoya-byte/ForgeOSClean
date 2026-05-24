import { recoverPreviewFailure } from './previewErrorRecovery';
import { updateLivePreviewState } from './livePreviewState';

export function recoverLivePreview(
  reason: string,
) {
  const recovery = recoverPreviewFailure(reason);

  updateLivePreviewState({
    restartCount: recovery.recovered
      ? 1
      : 0,
  });

  return recovery;
}
