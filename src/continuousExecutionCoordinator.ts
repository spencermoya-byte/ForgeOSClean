import { queueTask, updateTaskStatus } from './taskQueue';
import { updateAgentTransparency } from './agentTransparency';
import { pushTimelineEvent } from './sessionTimeline';

export type ExecutionPhase =
  | 'planning'
  | 'editing'
  | 'verification'
  | 'repair'
  | 'complete';

export async function runContinuousExecution(
  title: string,
  runner: () => Promise<void>,
) {
  const task = queueTask(title);

  try {
    updateTaskStatus(task.id, 'running');

    updateAgentTransparency({
      currentTask: title,
      stage: 'planning',
      elapsedMs: 0,
    });

    pushTimelineEvent('plan', `Started: ${title}`);

    await runner();

    updateTaskStatus(task.id, 'completed');

    updateAgentTransparency({
      currentTask: title,
      stage: 'complete',
      confidence: 1,
    });

    pushTimelineEvent('verify', `Completed: ${title}`);
  } catch (error) {
    updateTaskStatus(task.id, 'failed');

    pushTimelineEvent(
      'repair',
      `Execution failed: ${String(error)}`,
    );

    throw error;
  }
}
