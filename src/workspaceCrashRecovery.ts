export type WorkspaceRecoveryState = {
  projectPath: string;
  openFiles: string[];
  activeFile?: string;
  unsavedFiles: string[];
  scrollPositions: Record<string, number>;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.workspaceRecovery.v1";

function readRecoveryStates(): WorkspaceRecoveryState[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeRecoveryStates(states: WorkspaceRecoveryState[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(states.slice(0, 50)));
  } catch {}
}

export function saveWorkspaceRecoveryState(state: WorkspaceRecoveryState) {
  const states = readRecoveryStates().filter(
    (entry) => entry.projectPath !== state.projectPath
  );

  writeRecoveryStates([
    {
      ...state,
      updatedAt: new Date().toISOString(),
    },
    ...states,
  ]);
}

export function getWorkspaceRecoveryState(projectPath: string) {
  return readRecoveryStates().find(
    (entry) => entry.projectPath === projectPath
  );
}

export function clearWorkspaceRecoveryState(projectPath: string) {
  writeRecoveryStates(
    readRecoveryStates().filter(
      (entry) => entry.projectPath !== projectPath
    )
  );
}
