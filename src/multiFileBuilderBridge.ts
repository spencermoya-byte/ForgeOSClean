import { prepareMultiFileDiffBatch } from "./multiFileDiffBatch";
import { createMultiFileExecutionPlan } from "./multiFileExecutionPlanner";
import { verifyMultiFilePlan } from "./multiFileVerification";

export type MultiFileBuilderRequest = {
  projectPath: string;
  task: string;
  files: Array<{
    relativePath: string;
    reason: string;
    priority: number;
  }>;
  diffMap: Record<string, string>;
};

export type MultiFileBuilderResult = {
  ok: boolean;
  planId?: string;
  summary: string;
};

export function runMultiFileBuilder(
  request: MultiFileBuilderRequest
): MultiFileBuilderResult {
  const plan = createMultiFileExecutionPlan(
    request.projectPath,
    request.task,
    request.files
  );

  const batch = prepareMultiFileDiffBatch(
    plan.id,
    request.diffMap
  );

  if (!batch.ok) {
    return {
      ok: false,
      planId: plan.id,
      summary: batch.summary,
    };
  }

  const verification = verifyMultiFilePlan(plan.id);

  return {
    ok: verification.ok,
    planId: plan.id,
    summary: verification.summary,
  };
}
