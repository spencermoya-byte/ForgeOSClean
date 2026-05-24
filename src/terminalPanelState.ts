export type TerminalPanelState = {
  open: boolean;
  running: boolean;
  activeCommand: string | null;
};

let state: TerminalPanelState = {
  open: true,
  running: false,
  activeCommand: null,
};

export function updateTerminalPanel(
  update: Partial<TerminalPanelState>,
) {
  state = {
    ...state,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-terminal-panel', {
      detail: state,
    }),
  );

  return state;
}

export function getTerminalPanelState() {
  return state;
}
