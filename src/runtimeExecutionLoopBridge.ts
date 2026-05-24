import { bootstrapExecutionRuntime } from './runtimeExecutionBootstrap';
import { notifyExecutionResult } from './notificationExecutionBridge';

export async function runExecutionLoopBridge(
  request: string,
  iframe: HTMLIFrameElement | null,
) {
  const result = await bootstrapExecutionRuntime(
    request,
    iframe,
  );

  notifyExecutionResult();

  return result;
}
