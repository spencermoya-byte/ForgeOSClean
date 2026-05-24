export type DirtyFile = {
  path: string;
  dirty: boolean;
  updatedAt: number;
};

let dirtyFiles: Record<string, DirtyFile> = {};

export function setEditorDirty(
  path: string,
  dirty: boolean,
) {
  dirtyFiles[path] = {
    path,
    dirty,
    updatedAt: Date.now(),
  };

  window.dispatchEvent(
    new CustomEvent('vivus-editor-dirty', {
      detail: dirtyFiles,
    }),
  );

  return dirtyFiles[path];
}

export function getDirtyFiles() {
  return Object.values(dirtyFiles);
}
