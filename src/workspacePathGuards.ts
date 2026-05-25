export const NO_ACTIVE_WORKSPACE_MESSAGE = "No active workspace selected. Open or create a project before building.";

export type WorkspacePathGuardResult =
  | { ok: true; projectPath: string }
  | { ok: false; reason: string };

export function normalizeWorkspacePath(projectPath: string | null | undefined) {
  return String(projectPath ?? "").trim();
}

export function guardWorkspacePath(projectPath: string | null | undefined): WorkspacePathGuardResult {
  const normalized = normalizeWorkspacePath(projectPath);
  if (!normalized) return { ok: false, reason: NO_ACTIVE_WORKSPACE_MESSAGE };
  return { ok: true, projectPath: normalized };
}

export function requireWorkspacePath(projectPath: string | null | undefined) {
  const guarded = guardWorkspacePath(projectPath);
  if (!guarded.ok) throw new Error(guarded.reason);
  return guarded.projectPath;
}
