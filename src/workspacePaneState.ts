export type WorkspacePane = {
  id: string;
  type: 'editor' | 'preview' | 'terminal' | 'ai';
  visible: boolean;
  width?: number;
  height?: number;
};

let panes: WorkspacePane[] = [
  { id: 'editor', type: 'editor', visible: true },
  { id: 'preview', type: 'preview', visible: true },
  { id: 'terminal', type: 'terminal', visible: true },
];

export function updateWorkspacePane(
  id: string,
  update: Partial<WorkspacePane>,
) {
  panes = panes.map((pane) =>
    pane.id === id ? { ...pane, ...update } : pane,
  );

  window.dispatchEvent(
    new CustomEvent('vivus-workspace-panes', {
      detail: panes,
    }),
  );

  return panes;
}

export function getWorkspacePanes() {
  return panes;
}
