import { getWorkspacePanes } from './workspacePaneState';
import { getWorkspaceLayout } from './workspaceLayoutState';

export function initializePanelRuntime() {
  return {
    panes: getWorkspacePanes(),
    layout: getWorkspaceLayout(),
  };
}
