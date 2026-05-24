export type LivePreviewState = {
  url: string | null;
  connected: boolean;
  lastHeartbeat: number | null;
  restartCount: number;
};

let state: LivePreviewState = {
  url: null,
  connected: false,
  lastHeartbeat: null,
  restartCount: 0,
};

export function updateLivePreviewState(
  update: Partial<LivePreviewState>,
) {
  state = {
    ...state,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-live-preview', {
      detail: state,
    }),
  );

  return state;
}

export function getLivePreviewState() {
  return state;
}
