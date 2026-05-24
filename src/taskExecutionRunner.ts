import { runContinuousExecution } from './continuousExecutionCoordinator';
import { enterExecutionStage } from './executionStageCoordinator';

export async function runTaskExecution(
  title: string,
  task: () => Promise<void>,
) {
  return runContinuousExecution(title, async () => {
    enterExecutionStage(
      'editing',
      `Running task: ${title}`,
    );

    await task();

    enterExecutionStage(
      'complete',
      `Completed task: ${title}`,
    );
  });
}
