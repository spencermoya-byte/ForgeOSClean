import { updateLivePreviewState } from './livePreviewState';

export function markPreviewHeartbeat() {
  return updateLivePreviewState({
    connected: true,
    lastHeartbeat: Date.now(),
  });
}

export function markPreviewDisconnected() {
  return updateLivePreviewState({
    connected: false,
  });
}
