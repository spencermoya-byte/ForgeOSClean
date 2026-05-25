export type WorkspaceValidationResult = {
  valid: boolean;
  normalizedPath: string;
  reason?: string;
};

const WINDOWS_ABSOLUTE_PATH = /^[a-zA-Z]:[\\/][^<>:"|?*]+/;
const UNIX_ABSOLUTE_PATH = /^\/[\w .~!@#$%^&()\-+=\[\]{};',/]+/;
const HOME_RELATIVE_PATH = /^~[\\/][^<>:"|?*]+/;

function normalizeWorkspacePath(path: string) {
  return path.trim().replace(/\\+/g, "/").replace(/\/+$/, "");
}

export function looksLikeWorkspacePath(path: string) {
  const normalizedPath = normalizeWorkspacePath(path);

  return (
    WINDOWS_ABSOLUTE_PATH.test(normalizedPath) ||
    UNIX_ABSOLUTE_PATH.test(normalizedPath) ||
    HOME_RELATIVE_PATH.test(normalizedPath)
  );
}

export function validateWorkspacePath(path: string): WorkspaceValidationResult {
  const normalizedPath = normalizeWorkspacePath(path);

  // Production behavior:
  // Natural language prompts are NOT invalid workspace paths.
  // They are build requests and should bypass validation.
  if (!looksLikeWorkspacePath(normalizedPath)) {
    return {
      valid: true,
      normalizedPath,
    };
  }

  if (!normalizedPath) {
    return { valid: false, normalizedPath, reason: "Workspace path is required." };
  }

  if (normalizedPath.length < 3) {
    return { valid: false, normalizedPath, reason: "Workspace path is too short." };
  }

  if (normalizedPath.includes("\0")) {
    return { valid: false, normalizedPath, reason: "Workspace path contains an invalid character." };
  }

  return { valid: true, normalizedPath };
}

export function requireValidWorkspacePath(path: string) {
  const result = validateWorkspacePath(path);
  if (!result.valid) throw new Error(result.reason ?? "Invalid workspace path.");
  return result.normalizedPath;
}
