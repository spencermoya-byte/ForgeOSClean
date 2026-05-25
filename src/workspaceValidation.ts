export type WorkspaceValidationResult = {
  valid: boolean;
  normalizedPath: string;
  reason?: string;
};

const WINDOWS_ABSOLUTE_PATH = /^[a-zA-Z]:[\\/]/;
const UNIX_ABSOLUTE_PATH = /^\//;
const HOME_PATH = /^~[\\/]/;

function normalizeWorkspacePath(path: string) {
  return path.trim().replace(/\\+/g, "/").replace(/\/+$/, "");
}

export function looksLikeWorkspacePath(path: string) {
  const normalized = normalizeWorkspacePath(path);

  return (
    WINDOWS_ABSOLUTE_PATH.test(normalized) ||
    UNIX_ABSOLUTE_PATH.test(normalized) ||
    HOME_PATH.test(normalized)
  );
}

export function validateWorkspacePath(
  path: string
): WorkspaceValidationResult {
  const normalizedPath = normalizeWorkspacePath(path);

  // Production behavior:
  // Natural-language prompts are NOT invalid workspace paths.
  // They are builder requests.
  if (!looksLikeWorkspacePath(normalizedPath)) {
    return {
      valid: true,
      normalizedPath,
    };
  }

  if (!normalizedPath) {
    return {
      valid: false,
      normalizedPath,
      reason: "Workspace path is required.",
    };
  }

  return {
    valid: true,
    normalizedPath,
  };
}

export function requireValidWorkspacePath(path: string) {
  const result = validateWorkspacePath(path);

  if (!result.valid) {
    throw new Error(result.reason ?? "Invalid workspace path.");
  }

  return result.normalizedPath;
}