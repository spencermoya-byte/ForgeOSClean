import { getWorkspaceHotkeys } from './workspaceHotkeysState';

export function initializeHotkeyRuntime() {
  return getWorkspaceHotkeys();
}
