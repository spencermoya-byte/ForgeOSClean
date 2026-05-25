import { prepareVerifiedEdit, type VerifiedEditState } from "./vivusExecutionLoop";
import type { BuilderExecutionGroup } from "./builderExecutionGroup";

export type BuilderGroupedVerifiedResult = {
  ok: boolean;
  mode: BuilderExecutionGroup["mode"];
  primary: VerifiedEditState | null;
  prepared: VerifiedEditState[];
  blocked: VerifiedEditState[];
  message: string;
};

export async function prepareGroupedVerifiedEdits(
  projectPath: string,
  planSummary: string,
  executionGroup: BuilderExecutionGroup,
): Promise<BuilderGroupedVerifiedResult> {
  const executableTargets = executionGroup.executionOrder.filter((step) => step.execute);

  if (!executableTargets.length) {
    return {
      ok: false,
      mode: executionGroup.mode,
      primary: null,
      prepared: [],
      blocked: [],
      message: "No executable files were available in the Builder execution group.",
    };
  }

  const states: VerifiedEditState[] = [];

  for (const target of executableTargets) {
    const scopedSummary = `${planSummary}\n\nCurrent grouped target: ${target.relativePath}\nTarget role: ${target.role}\nTarget reason: ${target.reason}`;
    const state = await prepareVerifiedEdit({
      projectPath,
      relativePath: target.relativePath,
      planSummary: scopedSummary,
    });
    states.push(state);
  }

  const prepared = states.filter((state) => state.stage === "diff-ready" && Boolean(state.proposal?.changed));
  const blocked = states.filter((state) => state.stage === "blocked");
  const primary = prepared[0] ?? states[0] ?? null;

  return {
    ok: prepared.length > 0 && blocked.length === 0,
    mode: executionGroup.mode,
    primary,
    prepared,
    blocked,
    message:
      prepared.length > 0
        ? `Prepared ${prepared.length} grouped edit${prepared.length === 1 ? "" : "s"} for approval.`
        : "No grouped edits produced a changed diff.",
  };
}
