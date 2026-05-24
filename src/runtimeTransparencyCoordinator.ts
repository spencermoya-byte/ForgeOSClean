import { getTransparencyPanelState } from './transparencyPanelState';
import { syncTransparencyPanel } from './transparencyBridge';

export function initializeTransparencyRuntime() {
  syncTransparencyPanel();

  return getTransparencyPanelState();
}
