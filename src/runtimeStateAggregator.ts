import { bootstrapVivusRuntime } from './runtimeAppBootstrap';
import { initializeWorkspaceShell } from './runtimeWorkspaceShellBridge';
import { initializePanelRuntime } from './runtimePanelCoordinator';

export function aggregateRuntimeState() {
  return {
    runtime: bootstrapVivusRuntime(),
    shell: initializeWorkspaceShell(),
    panels: initializePanelRuntime(),
  };
}
