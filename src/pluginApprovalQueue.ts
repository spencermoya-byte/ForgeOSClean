import { addPluginAuditEntry } from './pluginAuditTrail';

export type PluginApprovalStatus = 'pending' | 'approved' | 'denied';

export type PluginApprovalRequest = {
  id: string;
  pluginId: string;
  permission: string;
  reason: string;
  status: PluginApprovalStatus;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'vivus.pluginApprovalQueue.v1';

function readQueue(): PluginApprovalRequest[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: PluginApprovalRequest[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 150)));
  } catch {}
}

export function requestPluginApproval(pluginId: string, permission: string, reason: string) {
  const existing = readQueue().find(
    (item) => item.pluginId === pluginId && item.permission === permission && item.status === 'pending'
  );

  if (existing) return existing;

  const now = new Date().toISOString();
  const request: PluginApprovalRequest = {
    id: `plugin-approval-${Date.now()}`,
    pluginId,
    permission,
    reason,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  writeQueue([request, ...readQueue()]);
  addPluginAuditEntry(pluginId, 'Plugin approval requested', `${permission}: ${reason}`, 'approval');
  window.dispatchEvent(new CustomEvent('vivus-plugin-approval-updated', { detail: request }));
  return request;
}

export function resolvePluginApproval(requestId: string, status: Exclude<PluginApprovalStatus, 'pending'>) {
  const now = new Date().toISOString();
  let resolved: PluginApprovalRequest | undefined;

  const next = readQueue().map((item) => {
    if (item.id !== requestId) return item;
    resolved = { ...item, status, updatedAt: now };
    return resolved;
  });

  writeQueue(next);

  if (resolved) {
    addPluginAuditEntry(
      resolved.pluginId,
      status === 'approved' ? 'Plugin approval granted' : 'Plugin approval denied',
      resolved.permission,
      status === 'approved' ? 'allowed' : 'blocked'
    );
    window.dispatchEvent(new CustomEvent('vivus-plugin-approval-updated', { detail: resolved }));
  }

  return resolved;
}

export function listPluginApprovals(pluginId?: string) {
  const queue = readQueue();
  return pluginId ? queue.filter((item) => item.pluginId === pluginId) : queue;
}

export function isPluginPermissionApproved(pluginId: string, permission: string) {
  return readQueue().some(
    (item) => item.pluginId === pluginId && item.permission === permission && item.status === 'approved'
  );
}
