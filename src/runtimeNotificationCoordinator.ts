import { notifyExecutionResult } from './notificationExecutionBridge';
import { syncExecutionTimeline } from './timelineExecutionBridge';

export function finalizeRuntimeExecution() {
  syncExecutionTimeline();
  notifyExecutionResult();
}
