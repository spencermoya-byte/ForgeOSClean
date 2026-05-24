import { updatePreviewEmbedState } from './livePreviewEmbedState';

export function mountPreview(url: string) {
  return updatePreviewEmbedState({
    mounted: true,
    url,
    loading: true,
  });
}

export function previewLoaded() {
  return updatePreviewEmbedState({
    loading: false,
    lastReload: Date.now(),
  });
}

export function reloadPreview() {
  return updatePreviewEmbedState({
    loading: true,
    lastReload: Date.now(),
  });
}
