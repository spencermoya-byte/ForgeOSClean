export type WorkspaceSnapshot = {
  activeTabs: string[];
  activeProject: string | null;
  layout: string;
  timestamp: number;
};

let snapshot: WorkspaceSnapshot | null = null;

export function saveWorkspaceSnapshot(
  nextSnapshot: WorkspaceSnapshot,
) {
  snapshot = nextSnapshot;

  window.dispatchEvent(
    new CustomEvent('vivus-workspace-restore', {
      detail: snapshot,
    }),
  );

  return snapshot;
}

export function getWorkspaceSnapshot() {
  return snapshot;
}
