export type PreviewEmbedState = {
  mounted: boolean;
  url: string | null;
  loading: boolean;
  lastReload: number | null;
};

let state: PreviewEmbedState = {
  mounted: false,
  url: null,
  loading: false,
  lastReload: null,
};

export function updatePreviewEmbedState(
  update: Partial<PreviewEmbedState>,
) {
  state = {
    ...state,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-preview-embed', {
      detail: state,
    }),
  );

  return state;
}

export function getPreviewEmbedState() {
  return state;
}
