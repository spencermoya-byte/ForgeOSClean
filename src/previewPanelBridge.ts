import { mountPreview, previewLoaded } from './livePreviewEmbedCoordinator';
import { updateLivePreviewState } from './livePreviewState';

export function connectPreviewPanel(url: string) {
  updateLivePreviewState({
    url,
    connected: true,
  });

  mountPreview(url);

  setTimeout(() => {
    previewLoaded();
  }, 100);
}
