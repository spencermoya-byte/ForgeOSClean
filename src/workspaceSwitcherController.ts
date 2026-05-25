import { switchWorkspace } from "./workspaceProjectActions";
import { isProtectedWorkspacePath } from "./workspaceProtectedPaths";
import { getWorkspaceProjects } from "./workspaceSelectors";

export function activateWorkspaceById(workspaceId: string) {
  const id = workspaceId.trim();
  if (!id) return false;

  const workspace = getWorkspaceProjects().find((project) => project.id === id);
  if (!workspace) return false;

  const protectedPath = isProtectedWorkspacePath(workspace.rootPath ?? "");

  if (protectedPath.protected) {
    console.warn(
      `[Vivus Security] Blocked protected workspace activation: ${protectedPath.normalizedPath}`
    );

    return false;
  }

  const result = switchWorkspace(id);
  return result.ok;
}
