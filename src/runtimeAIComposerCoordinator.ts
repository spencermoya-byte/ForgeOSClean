import { getAIComposerState } from './aiComposerState';
import { getAutonomyLevel } from './autonomySelectorState';

export function initializeAIComposerRuntime() {
  return {
    composer: getAIComposerState(),
    autonomy: getAutonomyLevel(),
  };
}
