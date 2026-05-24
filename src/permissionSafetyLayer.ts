import { getAutonomyPermissions } from './autonomyManager';

export type SafetyAction =
  | 'file-create'
  | 'file-delete'
  | 'terminal-command'
  | 'package-install'
  | 'destructive-edit';

export function isActionAllowed(
  autonomy: 'light' | 'medium' | 'full',
  action: SafetyAction,
) {
  const permissions = getAutonomyPermissions(autonomy);

  switch (action) {
    case 'file-create':
      return permissions.fileCreation;

    case 'package-install':
      return permissions.packageInstall;

    case 'terminal-command':
      return permissions.terminal;

    case 'destructive-edit':
    case 'file-delete':
      return permissions.destructiveChanges;

    default:
      return false;
  }
}
