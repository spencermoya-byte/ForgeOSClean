import { createWorkspaceFromPath } from "./workspaceProjectActions";
import { projectRootFromPrompt } from "./workspaceProjectAdapter";

export type WorkspaceCreateResult = {
  created: boolean;
  projectId?: string;
  reason?: string;
};

export function createWorkspaceFromUserInput(input: string): WorkspaceCreateResult {
  const trimmed = input.trim();
  if (!trimmed) return { created: false, reason: "Workspace path is required." };

  const rootPath = projectRootFromPrompt(trimmed) || trimmed;
  const result = createWorkspaceFromPath(rootPath);

  if (!result.ok || !result.project) {
    return { created: false, reason: result.reason ?? "Workspace could not be created." };
  }

  return { created: true, projectId: result.project.id };
}
