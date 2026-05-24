import { createMultiFileExecutionPlan, type PlannedFileEdit } from "./multiFileExecutionPlanner";

export type MultiFileTaskResult = {
  projectPath: string;
  task: string;
  plannedFiles: PlannedFileEdit[];
};

function inferFilePriority(path: string) {
  if (path.includes("App.tsx")) return 100;
  if (path.endsWith(".tsx")) return 90;
  if (path.endsWith(".ts")) return 80;
  if (path.endsWith(".css")) return 70;
  return 50;
}

export function createMultiFilePlan(
  projectPath: string,
  task: string,
  candidateFiles: string[]
): MultiFileTaskResult {
  const plannedFiles: PlannedFileEdit[] = candidateFiles.map((file) => ({
    relativePath: file,
    reason: `Selected for task: ${task}`,
    priority: inferFilePriority(file),
    status: "planned",
  }));

  createMultiFileExecutionPlan(projectPath, task, plannedFiles);

  return {
    projectPath,
    task,
    plannedFiles,
  };
}
