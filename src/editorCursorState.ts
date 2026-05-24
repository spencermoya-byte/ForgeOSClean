export type EditorCursorPosition = {
  path: string;
  line: number;
  column: number;
};

let cursorState: EditorCursorPosition | null = null;

export function updateEditorCursor(
  position: EditorCursorPosition,
) {
  cursorState = position;

  window.dispatchEvent(
    new CustomEvent('vivus-editor-cursor', {
      detail: cursorState,
    }),
  );

  return cursorState;
}

export function getEditorCursor() {
  return cursorState;
}
