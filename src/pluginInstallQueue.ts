export type PluginInstallStatus = 'pending' | 'installing' | 'installed' | 'failed';

export type PluginInstallRequest = {
  id: string;
  pluginId: string;
  status: PluginInstallStatus;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'vivus.pluginInstallQueue.v1';

function readQueue(): PluginInstallRequest[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: PluginInstallRequest[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
  } catch {}
}

export function queuePluginInstall(pluginId: string) {
  const now = new Date().toISOString();
  const request: PluginInstallRequest = {
    id: `plugin-install-${Date.now()}`,
    pluginId,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  writeQueue([request, ...readQueue()]);
  window.dispatchEvent(new CustomEvent('vivus-plugin-install-updated', { detail: request }));
  return request;
}

export function updatePluginInstallStatus(requestId: string, status: PluginInstallStatus) {
  const now = new Date().toISOString();
  let updated: PluginInstallRequest | undefined;

  const next = readQueue().map((item) => {
    if (item.id !== requestId) return item;
    updated = { ...item, status, updatedAt: now };
    return updated;
  });

  writeQueue(next);
  if (updated) {
    window.dispatchEvent(new CustomEvent('vivus-plugin-install-updated', { detail: updated }));
  }

  return updated;
}

export function listPluginInstallQueue() {
  return readQueue();
}
