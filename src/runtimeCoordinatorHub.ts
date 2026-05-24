import { aggregateRuntimeState } from './runtimeStateAggregator';
import { evaluatePreviewRuntimeHealth } from './runtimePreviewHealthBridge';
import { evaluateExecutionRuntimeHealth } from './runtimeExecutionHealthBridge';

export function initializeRuntimeCoordinatorHub() {
  return {
    runtime: aggregateRuntimeState(),
    previewHealth:
      evaluatePreviewRuntimeHealth(),
    executionHealth:
      evaluateExecutionRuntimeHealth(),
  };
}
