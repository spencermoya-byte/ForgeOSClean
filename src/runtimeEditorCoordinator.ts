import { getWorkspaceTabs } from './workspaceTabState';
import { getDirtyFiles } from './editorDirtyState';
import { getEditorCursor } from './editorCursorState';
import { getEditorSelection } from './editorSelectionState';

export function initializeEditorRuntime() {
  return {
    tabs: getWorkspaceTabs(),
    dirtyFiles: getDirtyFiles(),
    cursor: getEditorCursor(),
    selection: getEditorSelection(),
  };
}
