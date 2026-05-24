import { initializeWorkspaceRuntime } from './runtimeWorkspaceCoordinator';
import { initializeEditorRuntime } from './runtimeEditorCoordinator';
import { initializeTerminalRuntime } from './runtimeTerminalCoordinator';
import { initializeAIComposerRuntime } from './runtimeAIComposerCoordinator';

export function bootstrapWorkspaceRuntime() {
  return {
    workspace: initializeWorkspaceRuntime(),
    editor: initializeEditorRuntime(),
    terminal: initializeTerminalRuntime(),
    composer: initializeAIComposerRuntime(),
  };
}
