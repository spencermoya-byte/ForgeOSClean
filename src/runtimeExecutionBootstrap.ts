import { runRuntimePipeline } from './runtimePipelineCoordinator';
import { resolveRuntimeAutonomy } from './runtimeAutonomyBridge';

export async function bootstrapExecutionRuntime(
  request: string,
  iframe: HTMLIFrameElement | null,
) {
  const autonomy = resolveRuntimeAutonomy();

  const execution = await runRuntimePipeline(
    request,
    iframe,
  );

  return {
    autonomy,
    execution,
  };
}
