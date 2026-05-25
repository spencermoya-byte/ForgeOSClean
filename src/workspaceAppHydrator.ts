import { getWorkspaceSnapshot } from "./stores/workspaceStore";
import { emitWorkspaceChanged, emitWorkspaceRefresh } from "./workspaceEvents";

export function hydrateWorkspaceAppState() {
  const snapshot = getWorkspaceSnapshot();
  emitWorkspaceChanged(snapshot);
  emitWorkspaceRefresh();
  return snapshot;
}

export function hasHydratedWorkspaceAppState() {
  return getWorkspaceSnapshot().projects.length > 0 || Boolean(getWorkspaceSnapshot().activeProject);
}
