export type PreviewRefreshState = {
  lastRefresh: number | null;
  refreshCount: number;
  autoRefresh: boolean;
};

let state: PreviewRefreshState = {
  lastRefresh: null,
  refreshCount: 0,
  autoRefresh: true,
};

export function triggerPreviewRefresh() {
  state = {
    ...state,
    lastRefresh: Date.now(),
    refreshCount: state.refreshCount + 1,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-preview-refresh', {
      detail: state,
    }),
  );

  return state;
}

export function getPreviewRefreshState() {
  return state;
}
