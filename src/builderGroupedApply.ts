import {
  applyAndVerifyEdit,
  checkpointVerifiedEdit,
  type VerifiedEditState,
} from "./vivusExecutionLoop";

export type BuilderGroupedApplyResult = {
  ok: boolean;
  applied: VerifiedEditState[];
  failed: VerifiedEditState | null;
  message: string;
};

export async function applyGroupedVerifiedEdits(
  prepared: VerifiedEditState[],
  planSummary: string,
): Promise<BuilderGroupedApplyResult> {
  const applied: VerifiedEditState[] = [];

  for (const state of prepared) {
    if (state.stage !== "diff-ready" || !state.proposal?.changed) {
      const failed = {
        ...state,
        stage: "blocked" as const,
        message: state.message || "Grouped apply requires a changed diff-ready state.",
      };

      return {
        ok: false,
        applied,
        failed,
        message: failed.message,
      };
    }

    const checkpointed = await checkpointVerifiedEdit(state);
    if (checkpointed.stage !== "checkpoint-ready") {
      return {
        ok: false,
        applied,
        failed: checkpointed,
        message: checkpointed.message,
      };
    }

    const result = await applyAndVerifyEdit(checkpointed, planSummary);
    applied.push(result);

    if (result.stage !== "verified" && result.stage !== "repaired") {
      return {
        ok: false,
        applied,
        failed: result,
        message: result.message,
      };
    }
  }

  return {
    ok: true,
    applied,
    failed: null,
    message: `Applied and verified ${applied.length} grouped edit${applied.length === 1 ? "" : "s"}.`,
  };
}
