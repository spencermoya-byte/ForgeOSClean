import { resolveExecutionTargets } from './multiFileExecutionBridge';

export function prepareMultiFilePatch(
  request: string,
) {
  const targets = resolveExecutionTargets(
    request,
  );

  return {
    files: targets.plan.map(
      (file) => file.relativePath,
    ),
    scope: targets.scope,
  };
}
