import { invoke } from "@tauri-apps/api/core";
import { createWorkspaceFromPath } from "./workspaceProjectActions";
import { projectRootFromPrompt } from "./workspaceProjectAdapter";
import { validateSafeWorkspacePath } from "./workspaceSafeValidation";

export type WorkspaceCreateResult = {
  created: boolean;
  projectId?: string;
  reason?: string;
};

export async function createWorkspaceFromUserInput(
  input: string
): Promise<WorkspaceCreateResult> {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      created: false,
      reason: "Workspace path is required.",
    };
  }

  const rootPath =
    projectRootFromPrompt(trimmed) ||
    trimmed;

  const validation =
    validateSafeWorkspacePath(
      rootPath
    );

  if (!validation.valid) {
    return {
      created: false,
      reason:
        validation.reason ??
        "Workspace path is invalid.",
    };
  }

  const filesystemResult =
    await invoke<{
      ok: boolean;
      reason?: string;
    }>(
      "vivus_ensure_workspace_structure",
      {
        rootPath:
          validation.normalizedPath,
      }
    );

  if (!filesystemResult.ok) {
    return {
      created: false,
      reason:
        filesystemResult.reason ??
        "Workspace filesystem creation failed.",
    };
  }

  const result =
    createWorkspaceFromPath(
      validation.normalizedPath
    );

  if (
    !result.ok ||
    !result.project
  ) {
    return {
      created: false,
      reason:
        result.reason ??
        "Workspace could not be created.",
    };
  }

  return {
    created: true,
    projectId:
      result.project.id,
  };
}
