import { getWorkspaceLayout } from './workspaceLayoutState';
import { getWorkspaceTabs } from './workspaceTabState';
import { getProjectTree } from './projectTreeState';

export function initializeWorkspaceRuntime() {
  return {
    layout: getWorkspaceLayout(),
    tabs: getWorkspaceTabs(),
    projectTree: getProjectTree(),
  };
}
