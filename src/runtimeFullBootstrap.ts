import { bootstrapVivusRuntime } from './runtimeAppBootstrap';
import { bootstrapPreviewRuntime } from './runtimePreviewBootstrap';
import { bootstrapExecutionRuntime } from './runtimeExecutionBootstrap';

export async function bootstrapFullVivusRuntime(
  request: string,
  iframe: HTMLIFrameElement | null,
) {
  const runtime = bootstrapVivusRuntime();

  const preview = await bootstrapPreviewRuntime(
    iframe,
  );

  const execution = await bootstrapExecutionRuntime(
    request,
    iframe,
  );

  return {
    runtime,
    preview,
    execution,
  };
}
