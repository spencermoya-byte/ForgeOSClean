export type DraftDiff = {
  addedFiles: string[];
  removedFiles: string[];
  modifiedFiles: string[];
};

export function compareDraftFiles(beforeFiles: string[], afterFiles: string[]): DraftDiff {
  return {
    addedFiles: afterFiles.filter((file) => !beforeFiles.includes(file)),
    removedFiles: beforeFiles.filter((file) => !afterFiles.includes(file)),
    modifiedFiles: afterFiles.filter((file) => beforeFiles.includes(file)),
  };
}
