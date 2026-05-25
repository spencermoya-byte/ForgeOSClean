import { validateWorkspacePath, type WorkspaceValidationResult } from "./workspaceValidation";
import { isProtectedWorkspacePath } from "./workspaceProtectedPaths";

export function validateSafeWorkspacePath(path: string): WorkspaceValidationResult {
  const validation = validateWorkspacePath(path);

  if (!validation.valid) return validation;

  const protectedPath = isProtectedWorkspacePath(validation.normalizedPath);

  if (protectedPath.protected) {
    return {
      valid: false,
      normalizedPath: validation.normalizedPath,
      reason: protectedPath.reason ?? "Workspace path is protected.",
    };
  }

  return validation;
}

export function requireSafeWorkspacePath(path: string) {
  const result = validateSafeWorkspacePath(path);
  if (!result.valid) throw new Error(result.reason ?? "Invalid workspace path.");
  return result.normalizedPath;
}
