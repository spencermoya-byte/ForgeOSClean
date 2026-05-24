import { createVivusImplementationPlan, planToCoderSummary } from './builderPlanner';
import { prepareVerifiedEdit, checkpointVerifiedEdit, applyAndVerifyEdit } from './vivusExecutionLoop';

export async function runVivusPlannedExecution(request) {
  const plan = await createVivusImplementationPlan(request.planSummary);

  const plannedRequest = {
    ...request,
    planSummary: planToCoderSummary(plan),
  };

  const prepared = await prepareVerifiedEdit(plannedRequest);

  if (prepared.stage !== 'diff-ready' || !prepared.proposal?.changed) {
    return { plan, execution: prepared };
  }

  const checkpointed = await checkpointVerifiedEdit(prepared);

  if (checkpointed.stage !== 'checkpoint-ready') {
    return { plan, execution: checkpointed };
  }

  const execution = await applyAndVerifyEdit(
    checkpointed,
    plannedRequest.planSummary,
  );

  return { plan, execution };
}
