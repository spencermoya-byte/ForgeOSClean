import { buildPlannerContext } from './plannerMemoryBridge';

export function initializeRuntimeMemory(
  request: string,
) {
  return {
    request,
    context: buildPlannerContext(request),
    initializedAt: Date.now(),
  };
}
