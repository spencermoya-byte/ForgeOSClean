export type WorkspaceSession = {
  id: string;
  projectPath: string;
  startedAt: number;
  activeFiles: string[];
};

let activeSession: WorkspaceSession | null = null;

export function startWorkspaceSession(projectPath: string) {
  activeSession = {
    id: `workspace-${Date.now()}`,
    projectPath,
    startedAt: Date.now(),
    activeFiles: [],
  };

  window.dispatchEvent(
    new CustomEvent('vivus-workspace-session', {
      detail: activeSession,
    }),
  );

  return activeSession;
}

export function addWorkspaceFile(relativePath: string) {
  if (!activeSession) return null;

  activeSession.activeFiles = [
    ...new Set([
      ...activeSession.activeFiles,
      relativePath,
    ]),
  ];

  window.dispatchEvent(
    new CustomEvent('vivus-workspace-session', {
      detail: activeSession,
    }),
  );

  return activeSession;
}

export function getWorkspaceSession() {
  return activeSession;
}
