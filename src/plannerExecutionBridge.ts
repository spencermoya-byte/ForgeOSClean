import { buildPlannerContext } from './plannerMemoryBridge';
import { buildMultiFileExecutionPlan } from './multiFileExecutionPlan';

export type PlannerExecutionContext = {
  request: string;
  plannerContext: string;
  targetFiles: string[];
};

export function buildPlannerExecutionContext(
  request: string,
): PlannerExecutionContext {
  const plannerContext = buildPlannerContext(request);

  const targetFiles = buildMultiFileExecutionPlan(
    request,
  ).map((target) => target.relativePath);

  return {
    request,
    plannerContext,
    targetFiles,
  };
}
