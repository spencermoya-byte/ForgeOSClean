export type PermissionActionKind =
  | 'file-create'
  | 'file-modify'
  | 'file-delete'
  | 'terminal-command'
  | 'package-install'
  | 'git-action'
  | 'project-action'
  | 'destructive-action';

export type PermissionRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type PermissionDecision = {
  allowed: boolean;
  requiresApproval: boolean;
  risk: PermissionRiskLevel;
  reason: string;
};

const DESTRUCTIVE_PATTERNS = [
  'rm -rf',
  'del /s',
  'rmdir',
  'format',
  'git reset --hard',
  'git clean -fd',
  'npm uninstall',
];

export function evaluatePermissionAction(
  kind: PermissionActionKind,
  description: string,
  autonomyMode: 'light' | 'medium' | 'full' | 'custom' = 'light'
): PermissionDecision {
  const normalized = description.toLowerCase();
  const destructive = kind === 'destructive-action' || DESTRUCTIVE_PATTERNS.some((pattern) => normalized.includes(pattern));

  if (destructive) {
    return {
      allowed: false,
      requiresApproval: true,
      risk: 'critical',
      reason: 'Destructive action requires explicit approval.',
    };
  }

  if (kind === 'file-delete') {
    return {
      allowed: autonomyMode === 'full',
      requiresApproval: autonomyMode !== 'full',
      risk: 'high',
      reason: 'File deletion is high risk.',
    };
  }

  if (kind === 'package-install' || kind === 'git-action') {
    return {
      allowed: autonomyMode === 'medium' || autonomyMode === 'full',
      requiresApproval: autonomyMode === 'light' || autonomyMode === 'custom',
      risk: 'medium',
      reason: 'Package and git actions require mode-aware approval.',
    };
  }

  if (kind === 'terminal-command') {
    return {
      allowed: autonomyMode !== 'custom',
      requiresApproval: autonomyMode === 'light',
      risk: 'medium',
      reason: 'Terminal commands are allowed only within configured autonomy boundaries.',
    };
  }

  return {
    allowed: true,
    requiresApproval: autonomyMode === 'light' && kind !== 'file-modify',
    risk: kind === 'file-modify' ? 'low' : 'medium',
    reason: 'Action is within configured permission boundaries.',
  };
}
