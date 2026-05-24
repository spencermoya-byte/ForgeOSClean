import { buildMultiFileExecutionPlan } from './multiFileExecutionPlan';
import { buildPatchScope } from './multiFilePatchScope';

export function resolveExecutionTargets(
  request: string,
) {
  const plan = buildMultiFileExecutionPlan(request);

  const scope = buildPatchScope(
    plan.map((file) => file.relativePath),
  );

  return {
    plan,
    scope,
  };
}
