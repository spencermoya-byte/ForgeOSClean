export type VivusWorkspaceStatus = 'active' | 'draft' | 'archived';

export type VivusWorkspaceRecord = {
  id: string;
  name: string;
  projectPath: string;
  description: string;
  status: VivusWorkspaceStatus;
  lastOpenedAt: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'vivus.workspaceRegistry.v1';
const ACTIVE_KEY = 'vivus.activeWorkspace.v1';

function readRegistry(): VivusWorkspaceRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeRegistry(records: VivusWorkspaceRecord[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 200)));
  } catch {}
}

export function listVivusWorkspaces() {
  return readRegistry().sort((a, b) => b.lastOpenedAt.localeCompare(a.lastOpenedAt));
}

export function getActiveVivusWorkspace() {
  try {
    const id = window.localStorage.getItem(ACTIVE_KEY);
    return id ? readRegistry().find((workspace) => workspace.id === id) ?? null : null;
  } catch {
    return null;
  }
}

export function upsertVivusWorkspace(input: Omit<VivusWorkspaceRecord, 'createdAt' | 'updatedAt' | 'lastOpenedAt'> & Partial<Pick<VivusWorkspaceRecord, 'createdAt' | 'updatedAt' | 'lastOpenedAt'>>) {
  const now = new Date().toISOString();
  const existing = readRegistry().find((workspace) => workspace.id === input.id);
  const next: VivusWorkspaceRecord = {
    ...input,
    createdAt: input.createdAt ?? existing?.createdAt ?? now,
    updatedAt: now,
    lastOpenedAt: input.lastOpenedAt ?? existing?.lastOpenedAt ?? now,
  };

  writeRegistry([next, ...readRegistry().filter((workspace) => workspace.id !== next.id)]);
  window.dispatchEvent(new CustomEvent('vivus-workspace-registry-updated', { detail: next }));
  return next;
}

export function activateVivusWorkspace(workspaceId: string) {
  const workspace = readRegistry().find((item) => item.id === workspaceId);
  if (!workspace) return null;

  const next = { ...workspace, lastOpenedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  writeRegistry([next, ...readRegistry().filter((item) => item.id !== workspaceId)]);

  try {
    window.localStorage.setItem(ACTIVE_KEY, workspaceId);
  } catch {}

  window.dispatchEvent(new CustomEvent('vivus-active-workspace-updated', { detail: next }));
  return next;
}

export function archiveVivusWorkspace(workspaceId: string) {
  const workspace = readRegistry().find((item) => item.id === workspaceId);
  if (!workspace) return null;
  return upsertVivusWorkspace({ ...workspace, status: 'archived' });
}
