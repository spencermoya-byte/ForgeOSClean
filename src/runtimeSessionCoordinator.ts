import { restoreWorkspaceState } from './workspaceRestoreBridge';
import { syncTransparencyPanel } from './transparencyBridge';

export function initializeRuntimeSession() {
  restoreWorkspaceState();
  syncTransparencyPanel();
}
