export type LiveCanvasState = {
  active: boolean;
  draftId: string | null;
  changedFiles: string[];
  startedAt: number | null;
};

let state: LiveCanvasState = {
  active: false,
  draftId: null,
  changedFiles: [],
  startedAt: null,
};

export function startLiveCanvas() {
  state = {
    active: true,
    draftId: `draft-${Date.now()}`,
    changedFiles: [],
    startedAt: Date.now(),
  };

  window.dispatchEvent(
    new CustomEvent('vivus-live-canvas', {
      detail: state,
    }),
  );

  return state;
}

export function updateLiveCanvasFiles(
  files: string[],
) {
  state.changedFiles = [
    ...new Set([
      ...state.changedFiles,
      ...files,
    ]),
  ];

  window.dispatchEvent(
    new CustomEvent('vivus-live-canvas', {
      detail: state,
    }),
  );
}

export function finishLiveCanvas() {
  state.active = false;

  window.dispatchEvent(
    new CustomEvent('vivus-live-canvas', {
      detail: state,
    }),
  );

  return state;
}
