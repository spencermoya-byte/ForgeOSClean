export type TransparencyPanelState = {
  open: boolean;
  currentStage: string;
  currentTask: string;
  confidence: number;
};

let state: TransparencyPanelState = {
  open: false,
  currentStage: 'idle',
  currentTask: 'Idle',
  confidence: 1,
};

export function updateTransparencyPanel(
  update: Partial<TransparencyPanelState>,
) {
  state = {
    ...state,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-transparency-panel', {
      detail: state,
    }),
  );

  return state;
}

export function getTransparencyPanelState() {
  return state;
}
