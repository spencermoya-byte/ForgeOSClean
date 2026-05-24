import { runCommandPaletteAction } from './runtimeCommandPaletteCoordinator';
import { pushTimelineEvent } from './sessionTimeline';

export function executeRuntimeCommand(
  action: string,
) {
  pushTimelineEvent(
    'edit',
    `Command executed: ${action}`,
  );

  return runCommandPaletteAction(action);
}
