import type { AutonomyPolicy } from './autonomyPolicy';

export type ExecutionPermission = {
  fileEdit: boolean;
  terminal: boolean;
  packageInstall: boolean;
  deleteFiles: boolean;
};

export type PermissionEvaluation = {
  allowed: boolean;
  requiresApproval: boolean;
  blockedReason: string | null;
};

export function evaluateExecutionPermission(
  action: keyof ExecutionPermission,
  permissions: ExecutionPermission,
  policy: AutonomyPolicy
): PermissionEvaluation {
  if (!permissions[action]) {
    return {
      allowed: false,
      requiresApproval: false,
      blockedReason: `${action} permission is disabled.`,
    };
  }

  if (action === 'terminal' && policy.terminalAccess === 'blocked') {
    return {
      allowed: false,
      requiresApproval: false,
      blockedReason: 'Terminal access blocked by autonomy mode.',
    };
  }

  if (action === 'packageInstall' && policy.packageInstall === 'blocked') {
    return {
      allowed: false,
      requiresApproval: false,
      blockedReason: 'Package installation blocked by autonomy mode.',
    };
  }

  return {
    allowed: true,
    requiresApproval: policy.requiresApproval,
    blockedReason: null,
  };
}
