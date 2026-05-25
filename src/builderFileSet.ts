import type { BuilderImplementationPlan } from "./builderImplementationPlan";

export type BuilderFileSetItem = {
  relativePath: string;
  kind: "main" | "related";
  reason: string;
};

export type BuilderFileSet = {
  mainFile: BuilderFileSetItem | null;
  relatedFiles: BuilderFileSetItem[];
  files: BuilderFileSetItem[];
  mode: "single" | "group";
};

export function createBuilderFileSet(plan: BuilderImplementationPlan): BuilderFileSet {
  const main = plan.candidateFiles[0];
  const related = plan.candidateFiles.slice(1, 4);

  const mainFile = main
    ? {
        relativePath: main.relativePath,
        kind: "main" as const,
        reason: main.reason,
      }
    : null;

  const relatedFiles = related.map((file) => ({
    relativePath: file.relativePath,
    kind: "related" as const,
    reason: file.reason,
  }));

  const files = mainFile ? [mainFile, ...relatedFiles] : relatedFiles;

  return {
    mainFile,
    relatedFiles,
    files,
    mode: files.length > 1 && plan.riskLevel !== "low" ? "group" : "single",
  };
}

export function summarizeBuilderFileSet(fileSet: BuilderFileSet) {
  const main = fileSet.mainFile?.relativePath ?? "none";
  const related = fileSet.relatedFiles.map((file) => file.relativePath).join(", ") || "none";
  return `Mode: ${fileSet.mode}\nMain: ${main}\nRelated: ${related}`;
}
