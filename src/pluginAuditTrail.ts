export type PluginAuditEntry = {
  id: string;
  pluginId: string;
  label: string;
  detail: string;
  status: 'allowed' | 'approval' | 'blocked';
  createdAt: string;
};

const STORAGE_KEY = 'vivus.pluginAuditTrail.v1';

function readAuditTrail(): PluginAuditEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAuditTrail(entries: PluginAuditEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 150)));
  } catch {}
}

export function addPluginAuditEntry(pluginId: string, label: string, detail: string, status: PluginAuditEntry['status']) {
  const entry: PluginAuditEntry = {
    id: `plugin-audit-${Date.now()}`,
    pluginId,
    label,
    detail,
    status,
    createdAt: new Date().toISOString(),
  };

  writeAuditTrail([entry, ...readAuditTrail()]);
  window.dispatchEvent(new CustomEvent('vivus-plugin-audit-updated', { detail: entry }));
  return entry;
}

export function listPluginAuditTrail(pluginId?: string) {
  const entries = readAuditTrail();
  return pluginId ? entries.filter((entry) => entry.pluginId === pluginId) : entries;
}
