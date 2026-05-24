import { evaluatePluginPermission } from './pluginPermissionPolicy';
import type { VivusPluginPermission } from './pluginRegistry';

export type PluginActionKind =
  | 'open-panel'
  | 'read-project'
  | 'write-project'
  | 'run-command'
  | 'request-secret'
  | 'network-request';

export type PluginActionRequest = {
  pluginId: string;
  kind: PluginActionKind;
  description: string;
};

export type PluginActionDecision = {
  allowed: boolean;
  requiresApproval: boolean;
  reason: string;
};

const actionPermissionMap: Record<PluginActionKind, VivusPluginPermission> = {
  'open-panel': 'render-panel',
  'read-project': 'read-project',
  'write-project': 'write-project',
  'run-command': 'run-terminal',
  'request-secret': 'access-secrets',
  'network-request': 'access-network',
};

export function routePluginAction(request: PluginActionRequest): PluginActionDecision {
  const permission = actionPermissionMap[request.kind];
  const evaluation = evaluatePluginPermission(request.pluginId, permission);

  if (!evaluation.allowed) {
    return {
      allowed: false,
      requiresApproval: false,
      reason: evaluation.reason ?? `Plugin action blocked: ${request.kind}`,
    };
  }

  return {
    allowed: true,
    requiresApproval: evaluation.requiresApproval,
    reason: evaluation.requiresApproval
      ? `Plugin action requires approval: ${request.kind}`
      : `Plugin action allowed: ${request.kind}`,
  };
}
