import { getVivusPlugin, type VivusPluginPermission } from './pluginRegistry';

export type PluginPermissionResult = {
  allowed: boolean;
  reason: string | null;
  requiresApproval: boolean;
};

const highRiskPermissions = new Set<VivusPluginPermission>([
  'run-terminal',
  'access-network',
  'access-secrets',
  'write-project',
]);

export function evaluatePluginPermission(
  pluginId: string,
  permission: VivusPluginPermission
): PluginPermissionResult {
  const plugin = getVivusPlugin(pluginId);

  if (!plugin) {
    return {
      allowed: false,
      reason: 'Plugin not found.',
      requiresApproval: false,
    };
  }

  if (plugin.status === 'blocked' || plugin.status === 'disabled') {
    return {
      allowed: false,
      reason: `Plugin is ${plugin.status}.`,
      requiresApproval: false,
    };
  }

  if (!plugin.permissions.includes(permission)) {
    return {
      allowed: false,
      reason: `Missing permission: ${permission}`,
      requiresApproval: false,
    };
  }

  return {
    allowed: true,
    reason: null,
    requiresApproval: highRiskPermissions.has(permission),
  };
}
