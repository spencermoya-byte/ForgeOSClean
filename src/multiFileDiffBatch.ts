import {
  getMultiFileExecutionPlan,
  updateMultiFileExecutionPlan,
  updatePlannedFileEdit,
} from "./multiFileExecutionPlanner";
import { addMultiFileApproval } from "./multiFileApprovalQueue";

export type MultiFileDiffBatchResult = {
  ok: boolean;
  generatedDiffs: number;
  summary: string;
};

export function prepareMultiFileDiffBatch(
  planId: string,
  diffMap: Record<string, string>
): MultiFileDiffBatchResult {
  const plan = getMultiFileExecutionPlan(planId);

  if (!plan) {
    return {
      ok: false,
      generatedDiffs: 0,
      summary: "Execution plan not found.",
    };
  }

  let generatedDiffs = 0;

  for (const file of plan.files) {
    const diffPreview = diffMap[file.relativePath];

    if (!diffPreview) {
      updatePlannedFileEdit(planId, file.relativePath, {
        status: "blocked",
      });
      continue;
    }

    updatePlannedFileEdit(planId, file.relativePath, {
      status: "prepared",
      diffPreview,
    });

    addMultiFileApproval(
      planId,
      plan.projectPath,
      file.relativePath,
      diffPreview
    );

    generatedDiffs += 1;
  }

  const ok = generatedDiffs > 0;

  updateMultiFileExecutionPlan(planId, {
    status: ok ? "approval-ready" : "blocked",
    summary: ok
      ? `${generatedDiffs} file diff(s) ready for approval.`
      : "No valid diffs generated.",
  });

  return {
    ok,
    generatedDiffs,
    summary: ok
      ? `${generatedDiffs} file diff(s) ready for approval.`
      : "No valid diffs generated.",
  };
}
