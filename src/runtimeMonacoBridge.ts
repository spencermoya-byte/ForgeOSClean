import { getEditorCursor } from './editorCursorState';
import { getEditorSelection } from './editorSelectionState';
import { getDirtyFiles } from './editorDirtyState';

export function initializeMonacoRuntime() {
  return {
    cursor: getEditorCursor(),
    selection: getEditorSelection(),
    dirtyFiles: getDirtyFiles(),
  };
}
