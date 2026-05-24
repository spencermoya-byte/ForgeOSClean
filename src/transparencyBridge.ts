import { getAgentTransparency } from './agentTransparency';
import { updateTransparencyPanel } from './transparencyPanelState';

export function syncTransparencyPanel() {
  const transparency = getAgentTransparency();

  return updateTransparencyPanel({
    currentStage: transparency.stage,
    currentTask: transparency.currentTask,
    confidence: transparency.confidence,
  });
}
