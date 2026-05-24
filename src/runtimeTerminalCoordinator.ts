import { getTerminalPanelState } from './terminalPanelState';
import { updateTerminalPanel } from './terminalPanelState';

export function initializeTerminalRuntime() {
  const terminal = getTerminalPanelState();

  if (!terminal.open) {
    updateTerminalPanel({ open: true });
  }

  return getTerminalPanelState();
}
