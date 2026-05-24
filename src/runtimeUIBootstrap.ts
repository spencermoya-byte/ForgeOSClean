import { initializeDiagnosticsRuntime } from './runtimeDiagnosticsCoordinator';
import { initializeNotificationRuntime } from './runtimeNotificationCenterCoordinator';
import { initializeTransparencyRuntime } from './runtimeTransparencyCoordinator';
import { initializeTimelineRuntime } from './runtimeTimelineCoordinator';

export function bootstrapUIRuntime() {
  return {
    diagnostics: initializeDiagnosticsRuntime(),
    notifications: initializeNotificationRuntime(),
    transparency: initializeTransparencyRuntime(),
    timeline: initializeTimelineRuntime(),
  };
}
