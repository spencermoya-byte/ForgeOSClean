import { getRecentProjects } from './recentProjectsState';
import { getWorkspaceSelection } from './workspaceSelectionState';

export function initializeProjectRuntime() {
  return {
    projects: getRecentProjects(),
    selection: getWorkspaceSelection(),
  };
}
