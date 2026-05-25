import { createProject, removeProject, renameProject, setActiveProject, type VivusProject } from "./lib/projects/projectRegistry";
import { emitWorkspaceChanged, emitWorkspaceRefresh } from "./workspaceEvents";
import { getWorkspaceSnapshot } from "./stores/workspaceStore";
import { validateWorkspacePath } from "./workspaceValidation";

export type WorkspaceActionResult = {
  ok: boolean;
  project?: VivusProject | null;
  reason?: string;
};

function projectNameFromRoot(rootPath: string) {
  const normalized = rootPath.trim().replace(/\\+/g, "/").replace(/\/+$/, "");
  return normalized.split("/").filter(Boolean).pop() || "Untitled Workspace";
}

function emitWorkspaceAction() {
  emitWorkspaceChanged(getWorkspaceSnapshot());
  emitWorkspaceRefresh();
}

export function createWorkspaceFromPath(rootPath: string, name?: string): WorkspaceActionResult {
  const validation = validateWorkspacePath(rootPath);

  if (!validation.valid) {
    return {
      ok: false,
      reason: validation.reason ?? "Workspace path is invalid.",
    };
  }

  const next = createProject(
    name?.trim() || projectNameFromRoot(validation.normalizedPath),
    validation.normalizedPath,
  );

  const project = next.projects.find((item) => item.id === next.activeProjectId) ?? null;
  emitWorkspaceAction();

  return { ok: true, project };
}

export function switchWorkspace(projectId: string): WorkspaceActionResult {
  if (!projectId.trim()) return { ok: false, reason: "Workspace id is required." };

  const next = setActiveProject(projectId);
  const project = next.projects.find((item) => item.id === next.activeProjectId) ?? null;
  emitWorkspaceAction();

  return {
    ok: Boolean(project),
    project,
    reason: project ? undefined : "Workspace was not found.",
  };
}

export function renameWorkspace(projectId: string, name: string): WorkspaceActionResult {
  if (!projectId.trim()) return { ok: false, reason: "Workspace id is required." };
  if (!name.trim()) return { ok: false, reason: "Workspace name is required." };

  const next = renameProject(projectId, name);
  const project = next.projects.find((item) => item.id === projectId) ?? null;
  emitWorkspaceAction();

  return {
    ok: Boolean(project),
    project,
    reason: project ? undefined : "Workspace was not found.",
  };
}

export function deleteWorkspace(projectId: string): WorkspaceActionResult {
  if (!projectId.trim()) return { ok: false, reason: "Workspace id is required." };

  const next = removeProject(projectId);
  const project = next.projects.find((item) => item.id === next.activeProjectId) ?? null;
  emitWorkspaceAction();

  return { ok: true, project };
}
