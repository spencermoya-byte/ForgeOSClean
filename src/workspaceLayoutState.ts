export type WorkspacePanel =
  | 'editor'
  | 'preview'
  | 'terminal'
  | 'ai'
  | 'timeline';

export type WorkspaceLayoutState = {
  leftPanel: WorkspacePanel;
  rightPanel: WorkspacePanel;
  bottomPanel: WorkspacePanel;
};

let state: WorkspaceLayoutState = {
  leftPanel: 'ai',
  rightPanel: 'preview',
  bottomPanel: 'terminal',
};

export function updateWorkspaceLayout(
  update: Partial<WorkspaceLayoutState>,
) {
  state = {
    ...state,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-workspace-layout', {
      detail: state,
    }),
  );

  return state;
}

export function getWorkspaceLayout() {
  return state;
}
