import { getWorkspaceTabs } from './workspaceTabState';
import { getDirtyFiles } from './editorDirtyState';

export function initializeTabRuntime() {
  return {
    tabs: getWorkspaceTabs(),
    dirtyFiles: getDirtyFiles(),
  };
}
