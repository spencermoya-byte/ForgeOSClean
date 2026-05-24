export type DiagnosticPanelState = {
  open: boolean;
  unreadCount: number;
};

let state: DiagnosticPanelState = {
  open: false,
  unreadCount: 0,
};

export function updateDiagnosticPanel(
  update: Partial<DiagnosticPanelState>,
) {
  state = {
    ...state,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-diagnostic-panel', {
      detail: state,
    }),
  );

  return state;
}

export function incrementUnreadDiagnostics() {
  return updateDiagnosticPanel({
    unreadCount: state.unreadCount + 1,
  });
}
