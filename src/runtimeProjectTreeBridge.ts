import { getProjectTree } from './projectTreeState';
import { getWorkspaceSelection } from './workspaceSelectionState';

export function initializeProjectTreeRuntime() {
  return {
    tree: getProjectTree(),
    selection: getWorkspaceSelection(),
  };
}
