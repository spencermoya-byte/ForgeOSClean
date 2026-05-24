import { bootstrapWorkspaceRuntime } from './runtimeWorkspaceBootstrap';
import { bootstrapUIRuntime } from './runtimeUIBootstrap';
import { initializeRuntimeSession } from './runtimeSessionCoordinator';

export function bootstrapVivusRuntime() {
  initializeRuntimeSession();

  return {
    workspace: bootstrapWorkspaceRuntime(),
    ui: bootstrapUIRuntime(),
  };
}
