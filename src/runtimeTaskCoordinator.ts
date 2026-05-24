import { runTaskExecution } from './taskExecutionRunner';

export async function runRuntimeTask(
  title: string,
  task: () => Promise<void>,
) {
  return runTaskExecution(title, task);
}
