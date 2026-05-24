import { inferMultiFileTargets } from './multiFileCoordinator';
import { getRelatedFiles } from './fileRelationshipGraph';

export type MultiFileExecutionTarget = {
  relativePath: string;
  reason: string;
};

export function buildMultiFileExecutionPlan(
  request: string,
): MultiFileExecutionTarget[] {
  const directTargets = inferMultiFileTargets(request);

  const relatedTargets = directTargets.flatMap((target) =>
    getRelatedFiles(target.relativePath),
  );

  const combined = [
    ...directTargets.map((t) => ({
      relativePath: t.relativePath,
      reason: t.reason,
    })),
    ...relatedTargets.map((t) => ({
      relativePath: t.target,
      reason: t.reason,
    })),
  ];

  const unique = new Map();

  for (const target of combined) {
    unique.set(target.relativePath, target);
  }

  return Array.from(unique.values());
}
