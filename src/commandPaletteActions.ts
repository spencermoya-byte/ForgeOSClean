import { updateCommandPalette } from './commandPaletteState';
import { updateTerminalPanel } from './terminalPanelState';
import { updateWorkspaceLayout } from './workspaceLayoutState';

export function executePaletteAction(action: string) {
  switch (action) {
    case 'toggle-terminal':
      updateTerminalPanel({ open: true });
      break;

    case 'focus-preview':
      updateWorkspaceLayout({ rightPanel: 'preview' });
      break;

    case 'close-command-palette':
      updateCommandPalette({ open: false });
      break;
  }
}
