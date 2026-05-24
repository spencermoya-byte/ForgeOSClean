export type WorkspaceSelectionState = {
  selectedFile: string | null;
  selectedFolder: string | null;
};

let state: WorkspaceSelectionState = {
  selectedFile: null,
  selectedFolder: null,
};

export function updateWorkspaceSelection(
  update: Partial<WorkspaceSelectionState>,
) {
  state = {
    ...state,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-workspace-selection', {
      detail: state,
    }),
  );

  return state;
}

export function getWorkspaceSelection() {
  return state;
}
