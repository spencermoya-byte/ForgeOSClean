import { buildBuilderHistoryContext, listBuilderHistory } from "./builderHistory";
import { getWorkspaceProjectPath } from "./workspaceSync";

export function getBuilderContinuityContext(projectPath?: string) {
  const activeProject = projectPath || getWorkspaceProjectPath();
  return {
    projectPath: activeProject,
    history: listBuilderHistory(activeProject),
    promptContext: buildBuilderHistoryContext(activeProject),
  };
}

export function summarizeRecentBuilderActivity(projectPath?: string) {
  const { history } = getBuilderContinuityContext(projectPath);

  if (!history.length) {
    return "No previous builder activity for this project.";
  }

  return history
    .slice(0, 5)
    .map((entry, index) => `${index + 1}. ${entry.status} → ${entry.task}`)
    .join("\n");
}
