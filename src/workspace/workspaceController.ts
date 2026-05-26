import {
  createWorkspaceFromUserInput,
} from "../workspaceCreateRuntime";
import {
  activateWorkspaceById,
} from "../workspaceSwitcherController";
import {
  initializeProjectFiles,
} from "../ProjectFilesPanel";

export async function createWorkspace(
  prompt: string
) {
  const trimmed = prompt.trim();

  if (!trimmed) {
    return {
      ok: false,
      reason:
        "Describe the workspace or path first",
    };
  }

  const result =
    await createWorkspaceFromUserInput(
      trimmed
    );

  if (!result.created) {
    return {
      ok: false,
      reason:
        result.reason ??
        "Workspace could not be created",
    };
  }

  initializeProjectFiles();

  return {
    ok: true,
    projectId: result.projectId,
  };
}

export function openWorkspace(
  projectId: string
) {
  const switched =
    activateWorkspaceById(projectId);

  if (!switched) {
    return {
      ok: false,
      reason:
        "Workspace could not be opened",
    };
  }

  initializeProjectFiles();

  return {
    ok: true,
  };
}
