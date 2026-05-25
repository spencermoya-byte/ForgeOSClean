export type ProtectedWorkspacePathResult = {
  protected: boolean;
  normalizedPath: string;
  reason?: string;
};

const PROTECTED_REPO_ROOTS = [
  "c:/forgeosclean",
  "c:/vivus",
  "c:/deogloria",
];

const PROTECTED_APP_MARKERS = [
  "/src/",
  "/src-tauri/",
  "/.aider-modes/",
  "/scripts/",
  "/tauri.conf.json",
  "/package.json",
  "/vite.config",
  "/tsconfig",
];

export function normalizeProtectedWorkspacePath(path: string) {
  return path.trim().replace(/\\+/g, "/").replace(/\/+$/, "").toLowerCase();
}

export function isProtectedWorkspacePath(path: string): ProtectedWorkspacePathResult {
  const normalizedPath = normalizeProtectedWorkspacePath(path);

  if (!normalizedPath) {
    return { protected: false, normalizedPath };
  }

  if (PROTECTED_REPO_ROOTS.some((root) => normalizedPath === root || normalizedPath.startsWith(`${root}/`))) {
    return {
      protected: true,
      normalizedPath,
      reason: "Vivus cannot open or execute against its own application repository as a normal user workspace.",
    };
  }

  if (PROTECTED_APP_MARKERS.some((marker) => normalizedPath.includes(marker))) {
    return {
      protected: true,
      normalizedPath,
      reason: "Vivus application/runtime files are protected and cannot be used as Builder workspaces.",
    };
  }

  return { protected: false, normalizedPath };
}

export function requireUnprotectedWorkspacePath(path: string) {
  const result = isProtectedWorkspacePath(path);
  if (result.protected) throw new Error(result.reason ?? "Workspace path is protected.");
  return path;
}
