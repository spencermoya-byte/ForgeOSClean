export type VivusCheckpoint = {
  id: string;
  createdAt: string;
  label: string;
  changedFiles: string[];
  metadata?: Record<string, unknown>;
};

const STORAGE_KEY = 'vivus.checkpoints.v1';

function readCheckpoints(): VivusCheckpoint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCheckpoints(checkpoints: VivusCheckpoint[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(checkpoints.slice(0, 100)),
  );
}

export function createVivusCheckpoint(
  label: string,
  changedFiles: string[] = [],
  metadata?: Record<string, unknown>,
) {
  const checkpoints = readCheckpoints();

  const checkpoint: VivusCheckpoint = {
    id: `checkpoint-${Date.now()}`,
    createdAt: new Date().toISOString(),
    label,
    changedFiles,
    metadata,
  };

  checkpoints.unshift(checkpoint);
  saveCheckpoints(checkpoints);

  return checkpoint;
}

export function listVivusCheckpoints() {
  return readCheckpoints();
}
