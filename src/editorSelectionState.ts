export type EditorSelection = {
  path: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
};

let selection: EditorSelection | null = null;

export function updateEditorSelection(
  nextSelection: EditorSelection,
) {
  selection = nextSelection;

  window.dispatchEvent(
    new CustomEvent('vivus-editor-selection', {
      detail: selection,
    }),
  );

  return selection;
}

export function getEditorSelection() {
  return selection;
}
