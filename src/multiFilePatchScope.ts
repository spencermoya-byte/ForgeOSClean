export type PatchScope = {
  primaryFile: string | null;
  secondaryFiles: string[];
  totalFiles: number;
};

export function buildPatchScope(
  files: string[],
): PatchScope {
  return {
    primaryFile: files[0] ?? null,
    secondaryFiles: files.slice(1),
    totalFiles: files.length,
  };
}
