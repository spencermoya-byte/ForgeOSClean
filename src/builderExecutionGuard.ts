import { checkProtectedFilesystemAccess } from "./protectedFilesystemGuard";
import { getCurrentWorkspaceProject } from "./workspaceSelectors";

export type BuilderExecutionGuardResult = {
  allowed: boolean;
  projectPath: string;
  reason?: string;
};

function activeWorkspacePath() {
  const project = getCurrentWorkspaceProject();
  return project?.rootPath?.trim() ?? "";
}

function looksLikeFilesystemPath(value: string) {
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith("/") || value.startsWith("~");
}

export function resolveBuilderExecutionPath(projectPath?: string): string {
  const workspacePath = activeWorkspacePath();
  const requested = projectPath?.trim() ?? "";

  // User prompts should NEVER be treated as filesystem paths.
  // Only allow explicit absolute paths.
  if (!requested || requested === ".") {
    return workspacePath;
  }

  if (!looksLikeFilesystemPath(requested)) {
    return workspacePath;
  }

  return requested;
}

export function checkBuilderExecutionAllowed(projectPath?: string): BuilderExecutionGuardResult {
  const resolvedPath = resolveBuilderExecutionPath(projectPath);

  if (!resolvedPath) {
    return {
      allowed: false,
      projectPath: "",
      reason: "Select or create a workspace before building.",
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
  if (!result.allowed) {
    throw new Error(result.reason ?? "Builder execution blocked.");
  }
  return result.projectPath;
}
