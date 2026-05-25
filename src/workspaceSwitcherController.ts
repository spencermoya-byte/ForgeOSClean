import { switchWorkspace } from "./workspaceProjectActions";
import { getWorkspaceProjects } from "./workspaceSelectors";

export function activateWorkspaceById(workspaceId: string) {
  const id = workspaceId.trim();
  if (!id) return false;

  const exists = getWorkspaceProjects().some((project) => project.id === id);
  if (!exists) return false;

  const result = switchWorkspace(id);
  return result.ok;
}
