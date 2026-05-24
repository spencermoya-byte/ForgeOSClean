export type GitCheckpoint = {
  id: string;
  projectPath: string;
  label: string;
  description?: string;
  commitSha?: string;
  createdAt: string;
  source: "manual" | "builder" | "recovery" | "pre-change";
  restorable: boolean;
};

const STORAGE_KEY = "vivus.gitCheckpoints.v1";
const MAX_CHECKPOINTS = 150;

function readCheckpoints(): GitCheckpoint[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCheckpoints(checkpoints: GitCheckpoint[]) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(checkpoints.slice(0, MAX_CHECKPOINTS))
    );
  } catch {}
}

export function createGitCheckpoint(
  projectPath: string,
  label: string,
  source: GitCheckpoint["source"] = "manual",
  options?: Partial<Omit<GitCheckpoint, "id" | "projectPath" | "label" | "source" | "createdAt">>
) {
  const checkpoint: GitCheckpoint = {
    id: `checkpoint-${Date.now()}`,
    projectPath,
    label,
    source,
    createdAt: new Date().toISOString(),
    restorable: true,
    ...options,
  };

  writeCheckpoints([checkpoint, ...readCheckpoints()]);
  return checkpoint;
}

export function listGitCheckpoints(projectPath: string) {
  return readCheckpoints().filter(
    (checkpoint) => checkpoint.projectPath === projectPath
  );
}

export function getGitCheckpoint(checkpointId: string) {
  return readCheckpoints().find(
    (checkpoint) => checkpoint.id === checkpointId
  );
}

export function markCheckpointRestorable(
  checkpointId: string,
  restorable: boolean
) {
  writeCheckpoints(
    readCheckpoints().map((checkpoint) =>
      checkpoint.id === checkpointId
        ? { ...checkpoint, restorable }
        : checkpoint
    )
  );
}
