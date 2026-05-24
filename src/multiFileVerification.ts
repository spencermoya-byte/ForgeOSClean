import { getApprovalsForPlan } from "./multiFileApprovalQueue";
import {
  getMultiFileExecutionPlan,
  updateMultiFileExecutionPlan,
  updatePlannedFileEdit,
} from "./multiFileExecutionPlanner";

export type MultiFileVerificationResult = {
  ok: boolean;
  verifiedFiles: number;
  blockedFiles: number;
  summary: string;
};

export function verifyMultiFilePlan(
  planId: string
): MultiFileVerificationResult {
  const plan = getMultiFileExecutionPlan(planId);

  if (!plan) {
    return {
      ok: false,
      verifiedFiles: 0,
      blockedFiles: 0,
      summary: "Execution plan not found.",
    };
  }

  const approvals = getApprovalsForPlan(planId);

  let verifiedFiles = 0;
  let blockedFiles = 0;

  for (const file of plan.files) {
    const approval = approvals.find(
      (item) => item.relativePath === file.relativePath
    );

    const verified = approval?.status === "approved" || approval?.status === "applied";

    updatePlannedFileEdit(planId, file.relativePath, {
      status: verified ? "verified" : "blocked",
    });

    if (verified) verifiedFiles += 1;
    else blockedFiles += 1;
  }

  const ok = blockedFiles === 0;

  updateMultiFileExecutionPlan(planId, {
    status: ok ? "verified" : "blocked",
    summary: ok
      ? `Verified ${verifiedFiles} files.`
      : `${blockedFiles} file(s) blocked verification.`,
  });

  return {
    ok,
    verifiedFiles,
    blockedFiles,
    summary: ok
      ? `Verified ${verifiedFiles} files.`
      : `${blockedFiles} file(s) blocked verification.`,
  };
}
