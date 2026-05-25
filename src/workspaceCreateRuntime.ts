import { getActiveProjectPath } from "./lib/projects/projectRegistry";
import { createWorkspaceFromPath } from "./workspaceProjectActions";
import { projectRootFromPrompt } from "./workspaceProjectAdapter";
import { validateSafeWorkspacePath } from "./workspaceSafeValidation";

export type WorkspaceCreateResult = {
  created: boolean;
  projectId?: string;
  reason?: string;
};

function looksLikeAbsolutePath(value: string) {
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith("/") || value.startsWith("~");
}

export function createWorkspaceFromUserInput(input: string): WorkspaceCreateResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      created: false,
      reason: "Describe what to build or provide a workspace path.",
    };
  }

  // Production behavior:
  // Ideas/prompts should NOT be validated as filesystem paths.
  // Only explicit absolute paths are treated as workspace roots.
  const inferredPath = projectRootFromPrompt(trimmed);
  const requestedPath = inferredPath || trimmed;

  const isPathRequest = looksLikeAbsolutePath(requestedPath);

  // User entered an idea like "bedjet app"
  // Reuse current workspace if available instead of throwing a fake path error.
  if (!isPathRequest) {
    const activeWorkspace = getActiveProjectPath();

    if (activeWorkspace) {
      return {
        created: true,
        projectId: undefined,
      };
    }

    return {
      created: false,
      reason: "Select or create a local workspace before building.",
    };
  }

  const validation = validateSafeWorkspacePath(requestedPath);

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
