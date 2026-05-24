import { bootstrapVivusRuntime } from './runtimeAppBootstrap';
import { runRuntimeHealthChecks } from './runtimeHealthCoordinator';

export function bootstrapRuntimeWithHealth() {
  const runtime = bootstrapVivusRuntime();
  const health = runRuntimeHealthChecks();

  return {
    runtime,
    health,
  };
}
