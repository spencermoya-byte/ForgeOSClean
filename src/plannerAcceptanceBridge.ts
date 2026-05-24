import { evaluateAcceptanceCriteria } from './verificationAcceptance';
import type { VivusImplementationPlan } from './builderPlanner';

export function verifyPlannerAcceptance(
  plan: VivusImplementationPlan,
  verificationPassed: boolean,
) {
  return evaluateAcceptanceCriteria(
    plan.acceptanceCriteria,
    verificationPassed,
  );
}
