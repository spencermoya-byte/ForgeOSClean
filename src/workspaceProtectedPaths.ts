export type ProtectedWorkspacePathResult = {
  protected: boolean;
  normalizedPath: string;
  reason?: string;
};

// Protect actual system/runtime locations.
// Do NOT block the active Vivus development repo.
const PROTECTED_REPO_ROOTS = [
  "c:/vivus",
  "c:/deogloria",
];

const PROTECTED_SYSTEM_PATHS = [
  "c:/windows",
  "c:/program files",
  "c:/program files (x86)",
  "c:/programdata",
  "c:/users/default",
];

export function normalizeProtectedWorkspacePath(path: string) {
  return path.trim().replace(/\\+/g, "/").replace(/\/+$/, "").toLowerCase();
}

export function isProtectedWorkspacePath(path: string): ProtectedWorkspacePathResult {
  const normalizedPath = normalizeProtectedWorkspacePath(path);

  if (!normalizedPath) {
    return { protected: false, normalizedPath };
  }

  // Allow Vivus development repo.
  if (normalizedPath === "c:/forgeosclean") {
    return { protected: false, normalizedPath };
  }

  if (
    PROTECTED_SYSTEM_PATHS.some(
      (root) => normalizedPath === root || normalizedPath.startsWith(`${root}/`)
    )
  ) {
    return {
      protected: true,
      normalizedPath,
      reason:
        "System folders cannot be used as Builder workspaces.",
    };
  }

  if (
    PROTECTED_REPO_ROOTS.some(
      (root) => normalizedPath === root || normalizedPath.startsWith(`${root}/`)
    )
  ) {
    return {
      protected: true,
      normalizedPath,
      reason:
        "Vivus cannot execute against protected application repositories.",
    };
  }

  return { protected: false, normalizedPath };
}

export function requireUnprotectedWorkspacePath(path: string) {
  const result = isProtectedWorkspacePath(path);

  if (result.protected) {
    throw new Error(result.reason ?? "Workspace path is protected.");
  }

  return path;
}
