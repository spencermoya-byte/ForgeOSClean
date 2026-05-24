import { getRecentProjects } from './recentProjectsState';
import { saveWorkspaceSnapshot } from './workspaceRestoreState';

export function restoreWorkspaceState() {
  const projects = getRecentProjects();

  const activeProject = projects[0]?.path ?? null;

  return saveWorkspaceSnapshot({
    activeTabs: [],
    activeProject,
    layout: 'default',
    timestamp: Date.now(),
  });
}
