import { checkProtectedFilesystemAccess } from "./protectedFilesystemGuard";
import { getCurrentWorkspaceProject } from "./workspaceSelectors";

export type BuilderExecutionGuardResult = {
  allowed: boolean;
  projectPath: string;
  reason?: string;
};

function activeWorkspacePath() {
  const project = getCurrentWorkspaceProject();
  return project?.rootPath ?? project?.path ?? project?.originalPrompt ?? "";
}

export function resolveBuilderExecutionPath(projectPath?: string): string {
  const requestedPath = projectPath?.trim();
  if (requestedPath && requestedPath !== ".") return requestedPath;
  return activeWorkspacePath();
}

export function checkBuilderExecutionAllowed(projectPath?: string): BuilderExecutionGuardResult {
  const resolvedPath = resolveBuilderExecutionPath(projectPath);

  if (!resolvedPath.trim()) {
    return {
      allowed: false,
      projectPath: resolvedPath,
      reason: "Builder execution requires an active user workspace.",
    };
  }

  const decision = checkProtectedFilesystemAccess(resolvedPath, "execute");

  if (!decision.allowed) {
    return {
      allowed: false,
      projectPath: resolvedPath,
      reason: decision.reason ?? "Builder execution is blocked for this protected path.",
    };
  }

  return {
    allowed: true,
    projectPath: resolvedPath,
  };
}

export function requireBuilderExecutionAllowed(projectPath?: string) {
  const result = checkBuilderExecutionAllowed(projectPath);
  if (!result.allowed) throw new Error(result.reason ?? "Builder execution blocked.");
  return result.projectPath;
}
