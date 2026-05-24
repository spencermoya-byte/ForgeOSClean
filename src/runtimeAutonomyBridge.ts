import { getAutonomyLevel } from './autonomySelectorState';
import { buildAutonomyProfile } from './autonomyProfile';

export function resolveRuntimeAutonomy() {
  const level = getAutonomyLevel();

  return buildAutonomyProfile(level);
}
