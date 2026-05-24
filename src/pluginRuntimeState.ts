import { listVivusPlugins } from './pluginRegistry';
import { evaluatePluginPermission } from './pluginPermissionPolicy';

export type VivusPluginRuntimeState = {
  pluginId: string;
  status: 'ready' | 'needs-approval' | 'blocked' | 'disabled';
  panelReady: boolean;
  blockedReasons: string[];
  approvalReasons: string[];
  updatedAt: string;
};

const STORAGE_KEY = 'vivus.pluginRuntimeState.v1';

function savePluginRuntimeStates(states: VivusPluginRuntimeState[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  } catch {}
}

export function resolvePluginRuntimeStates() {
  const states = listVivusPlugins().map((plugin): VivusPluginRuntimeState => {
    const blockedReasons: string[] = [];
    const approvalReasons: string[] = [];

    if (plugin.status === 'disabled' || plugin.status === 'blocked') {
      return {
        pluginId: plugin.id,
        status: plugin.status,
        panelReady: false,
        blockedReasons: [`Plugin is ${plugin.status}.`],
        approvalReasons: [],
        updatedAt: new Date().toISOString(),
      };
    }

    for (const permission of plugin.permissions) {
      const result = evaluatePluginPermission(plugin.id, permission);
      if (!result.allowed && result.reason) blockedReasons.push(result.reason);
      if (result.requiresApproval) approvalReasons.push(permission);
    }

    return {
      pluginId: plugin.id,
      status: blockedReasons.length ? 'blocked' : approvalReasons.length ? 'needs-approval' : 'ready',
      panelReady: Boolean(plugin.panelId) && !blockedReasons.length,
      blockedReasons,
      approvalReasons,
      updatedAt: new Date().toISOString(),
    };
  });

  savePluginRuntimeStates(states);
  window.dispatchEvent(new CustomEvent('vivus-plugin-runtime-state', { detail: states }));
  return states;
}

export function readPluginRuntimeStates(): VivusPluginRuntimeState[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
