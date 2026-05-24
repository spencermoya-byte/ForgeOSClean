import { getAIComposerState } from './aiComposerState';
import { getWorkspaceLayout } from './workspaceLayoutState';

export function initializeDockRuntime() {
  return {
    composer: getAIComposerState(),
    layout: getWorkspaceLayout(),
  };
}
