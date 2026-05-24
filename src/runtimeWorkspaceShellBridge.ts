import { bootstrapWorkspaceRuntime } from './runtimeWorkspaceBootstrap';
import { bootstrapUIRuntime } from './runtimeUIBootstrap';

export function initializeWorkspaceShell() {
  return {
    workspace: bootstrapWorkspaceRuntime(),
    ui: bootstrapUIRuntime(),
  };
}
