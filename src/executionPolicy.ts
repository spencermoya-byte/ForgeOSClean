import { getAutonomyPolicy, type AutonomyMode, type AutonomyPolicy } from './autonomyPolicy';
import { evaluateExecutionPermission, type ExecutionPermission, type PermissionEvaluation } from './permissionPolicy';

export type ExecutionPolicyReport = {
  autonomyMode: AutonomyMode;
  policy: AutonomyPolicy;
  permissions: ExecutionPermission;
  evaluations: Record<keyof ExecutionPermission, PermissionEvaluation>;
  allowed: string[];
  approvalRequired: string[];
  blocked: string[];
  summary: string;
};

export const defaultExecutionPermissions: ExecutionPermission = {
  fileEdit: true,
  terminal: true,
  packageInstall: true,
  deleteFiles: false,
};

const actionLabels: Record<keyof ExecutionPermission, string> = {
  fileEdit: 'File edits',
  terminal: 'Terminal commands',
  packageInstall: 'Package installs',
  deleteFiles: 'File deletion',
};

export function createExecutionPolicyReport(
  autonomyMode: AutonomyMode,
  permissions: ExecutionPermission = defaultExecutionPermissions
): ExecutionPolicyReport {
  const policy = getAutonomyPolicy(autonomyMode);
  const actions = Object.keys(permissions) as Array<keyof ExecutionPermission>;
  const evaluations = actions.reduce((result, action) => {
    result[action] = evaluateExecutionPermission(action, permissions, policy);
    return result;
  }, {} as Record<keyof ExecutionPermission, PermissionEvaluation>);

  const allowed = actions.filter((action) => evaluations[action].allowed && !evaluations[action].requiresApproval).map((action) => actionLabels[action]);
  const approvalRequired = actions.filter((action) => evaluations[action].allowed && evaluations[action].requiresApproval).map((action) => actionLabels[action]);
  const blocked = actions.filter((action) => !evaluations[action].allowed).map((action) => `${actionLabels[action]} (${evaluations[action].blockedReason})`);

  const summary = [
    `Autonomy: ${policy.mode}`,
    `Behavior: ${policy.description}`,
    `Max file edits: ${policy.maxFileEdits}`,
    `Terminal: ${policy.terminalAccess}`,
    `Package install: ${policy.packageInstall}`,
    `Checkpoints: ${policy.checkpointFrequency}`,
    allowed.length ? `Allowed: ${allowed.join(', ')}` : 'Allowed: none without approval',
    approvalRequired.length ? `Approval required: ${approvalRequired.join(', ')}` : 'Approval required: none',
    blocked.length ? `Blocked: ${blocked.join('; ')}` : 'Blocked: none',
  ].join('\n');

  return {
    autonomyMode,
    policy,
    permissions,
    evaluations,
    allowed,
    approvalRequired,
    blocked,
    summary,
  };
}
