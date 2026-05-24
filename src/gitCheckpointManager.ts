import { addGitTimelineEntry } from "./gitTimelineStore";

export type GitCheckpoint = {
  id: string;
  projectPath: string;
  label: string;
  files: string[];
  createdAt: string;
};

const STORAGE_KEY = "vivus.gitCheckpoints.v1";

function readCheckpoints(): GitCheckpoint[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCheckpoints(items: GitCheckpoint[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 150)));
  } catch {}
}

export function createGitCheckpoint(
  projectPath: string,
  label: string,
  files: string[]
) {
  const checkpoint: GitCheckpoint = {
    id: `checkpoint-${Date.now()}`,
    projectPath,
    label,
    files,
    createdAt: new Date().toISOString(),
  };

  writeCheckpoints([checkpoint, ...readCheckpoints()]);

  addGitTimelineEntry({
    projectPath,
    type: "checkpoint",
    title: label,
    detail: "Checkpoint created",
    files,
  });

  return checkpoint;
}

export function listGitCheckpoints(projectPath: string) {
  return readCheckpoints().filter(
    (checkpoint) => checkpoint.projectPath === projectPath
  );
}
