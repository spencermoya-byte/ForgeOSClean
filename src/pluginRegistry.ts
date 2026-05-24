export type VivusPluginPermission =
  | 'read-project'
  | 'write-project'
  | 'run-terminal'
  | 'access-network'
  | 'access-secrets'
  | 'render-panel';

export type VivusPluginStatus = 'installed' | 'enabled' | 'disabled' | 'blocked';

export type VivusPlugin = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  status: VivusPluginStatus;
  permissions: VivusPluginPermission[];
  panelId?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'vivus.plugins.registry.v1';

export const corePlugins: VivusPlugin[] = [
  {
    id: 'core-live-preview',
    name: 'Live Preview',
    description: 'Runs and displays local project previews inside Vivus.',
    version: '1.0.0',
    author: 'Vivus Core',
    status: 'enabled',
    permissions: ['read-project', 'render-panel'],
    panelId: 'preview',
    createdAt: 'core',
    updatedAt: 'core',
  },
  {
    id: 'core-terminal',
    name: 'Terminal',
    description: 'Provides allowlisted local command execution and terminal workflows.',
    version: '1.0.0',
    author: 'Vivus Core',
    status: 'enabled',
    permissions: ['read-project', 'run-terminal', 'render-panel'],
    panelId: 'console',
    createdAt: 'core',
    updatedAt: 'core',
  },
  {
    id: 'core-commits',
    name: 'Commits',
    description: 'Tracks checkpoints, commits, rollback, and project history.',
    version: '1.0.0',
    author: 'Vivus Core',
    status: 'enabled',
    permissions: ['read-project', 'write-project', 'render-panel'],
    panelId: 'commits',
    createdAt: 'core',
    updatedAt: 'core',
  },
];

function readUserPlugins(): VivusPlugin[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUserPlugins(plugins: VivusPlugin[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plugins.slice(0, 100)));
  } catch {}
}

export function listVivusPlugins() {
  const userPlugins = readUserPlugins();
  const userIds = new Set(userPlugins.map((plugin) => plugin.id));
  return [...corePlugins.filter((plugin) => !userIds.has(plugin.id)), ...userPlugins];
}

export function registerVivusPlugin(plugin: Omit<VivusPlugin, 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const next: VivusPlugin = { ...plugin, createdAt: now, updatedAt: now };
  writeUserPlugins([next, ...readUserPlugins().filter((item) => item.id !== plugin.id)]);
  return next;
}

export function updateVivusPluginStatus(pluginId: string, status: VivusPluginStatus) {
  const now = new Date().toISOString();
  const existing = listVivusPlugins().find((plugin) => plugin.id === pluginId);
  if (!existing || existing.createdAt === 'core') return existing;

  const next = { ...existing, status, updatedAt: now };
  writeUserPlugins([next, ...readUserPlugins().filter((item) => item.id !== pluginId)]);
  return next;
}

export function getVivusPlugin(pluginId: string) {
  return listVivusPlugins().find((plugin) => plugin.id === pluginId);
}
