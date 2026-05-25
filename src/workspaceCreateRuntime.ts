import { createWorkspaceFromPath } from "./workspaceProjectActions";
import { projectRootFromPrompt } from "./workspaceProjectAdapter";
import { validateSafeWorkspacePath } from "./workspaceSafeValidation";

export type WorkspaceCreateResult = {
  created: boolean;
  projectId?: string;
  reason?: string;
};

export function createWorkspaceFromUserInput(input: string): WorkspaceCreateResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      created: false,
      reason: "Workspace path is required.",
    };
  }

  const rootPath = projectRootFromPrompt(trimmed) || trimmed;
  const validation = validateSafeWorkspacePath(rootPath);

  if (!validation.valid) {
    return {
      created: false,
      reason: validation.reason ?? "Workspace path is invalid.",
    };
  }

  const result = createWorkspaceFromPath(validation.normalizedPath);

  if (!result.ok || !result.project) {
    return {
      created: false,
      reason: result.reason ?? "Workspace could not be created.",
    };
  }

  return {
    created: true,
    projectId: result.project.id,
  };
}
