import type { VivusPluginPermission } from './pluginRegistry';

export type PluginTrustLevel = 'core' | 'verified' | 'community' | 'unknown';

export type PluginMarketplacePackage = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  trustLevel: PluginTrustLevel;
  permissions: VivusPluginPermission[];
  panelId?: string;
  tags: string[];
};

const MARKETPLACE_KEY = 'vivus.pluginMarketplace.v1';

export const bundledMarketplacePlugins: PluginMarketplacePackage[] = [
  {
    id: 'marketplace-rest-client',
    name: 'REST Client',
    description: 'Send local API requests from inside Vivus with permission-gated network access.',
    version: '0.1.0',
    author: 'Vivus Marketplace',
    trustLevel: 'verified',
    permissions: ['render-panel', 'access-network'],
    panelId: 'rest-client',
    tags: ['api', 'testing', 'network'],
  },
  {
    id: 'marketplace-env-inspector',
    name: 'Environment Inspector',
    description: 'Review local environment configuration and missing variable requirements.',
    version: '0.1.0',
    author: 'Vivus Marketplace',
    trustLevel: 'verified',
    permissions: ['read-project', 'render-panel'],
    panelId: 'env-inspector',
    tags: ['environment', 'secrets', 'project'],
  },
];

function readMarketplacePackages(): PluginMarketplacePackage[] {
  try {
    const raw = window.localStorage.getItem(MARKETPLACE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeMarketplacePackages(items: PluginMarketplacePackage[]) {
  try {
    window.localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(items.slice(0, 200)));
  } catch {}
}

export function listMarketplacePlugins() {
  const saved = readMarketplacePackages();
  const savedIds = new Set(saved.map((plugin) => plugin.id));
  return [...bundledMarketplacePlugins.filter((plugin) => !savedIds.has(plugin.id)), ...saved];
}

export function addMarketplacePlugin(plugin: PluginMarketplacePackage) {
  writeMarketplacePackages([plugin, ...readMarketplacePackages().filter((item) => item.id !== plugin.id)]);
  window.dispatchEvent(new CustomEvent('vivus-plugin-marketplace-updated', { detail: plugin }));
  return plugin;
}
