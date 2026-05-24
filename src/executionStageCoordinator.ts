import { updateAgentTransparency } from './agentTransparency';
import { pushTimelineEvent } from './sessionTimeline';

export function enterExecutionStage(
  stage:
    | 'planning'
    | 'targeting'
    | 'editing'
    | 'verifying'
    | 'repairing'
    | 'rollback'
    | 'complete',
  detail: string,
) {
  updateAgentTransparency({
    stage,
    currentTask: detail,
  });

  pushTimelineEvent(
    stage === 'verifying'
      ? 'verify'
      : stage === 'repairing'
        ? 'repair'
        : stage === 'rollback'
          ? 'rollback'
          : 'edit',
    detail,
  );
}
