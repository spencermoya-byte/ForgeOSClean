import { getAutonomyPermissions } from './autonomyManager';

export function buildAutonomyProfile(
  level: 'light' | 'medium' | 'full',
) {
  return {
    level,
    permissions: getAutonomyPermissions(level),
  };
}
