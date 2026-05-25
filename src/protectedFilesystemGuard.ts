import { isProtectedWorkspacePath } from "./workspaceProtectedPaths";

export type FilesystemAccessKind =
  | "read"
  | "write"
  | "create"
  | "delete"
  | "rename"
  | "move"
  | "search"
  | "index"
  | "watch"
  | "execute";

export type FilesystemAccessDecision = {
  allowed: boolean;
  path: string;
  kind: FilesystemAccessKind;
  reason?: string;
};

function deny(path: string, kind: FilesystemAccessKind, reason?: string): FilesystemAccessDecision {
  return {
    allowed: false,
    path,
    kind,
    reason: reason ?? `Protected filesystem ${kind} access denied.`,
  };
}

export function checkProtectedFilesystemAccess(path: string, kind: FilesystemAccessKind): FilesystemAccessDecision {
  const protectedPath = isProtectedWorkspacePath(path);

  if (protectedPath.protected) {
    return deny(
      path,
      kind,
      protectedPath.reason ?? `Vivus cannot ${kind} protected application/runtime files.`
    );
  }

  return {
    allowed: true,
    path,
    kind,
  };
}

export function requireProtectedFilesystemAccess(path: string, kind: FilesystemAccessKind) {
  const decision = checkProtectedFilesystemAccess(path, kind);

  if (!decision.allowed) {
    throw new Error(decision.reason ?? `Protected filesystem ${kind} access denied.`);
  }

  return path;
}

export function canReadFilesystemPath(path: string) {
  return checkProtectedFilesystemAccess(path, "read").allowed;
}

export function canWriteFilesystemPath(path: string) {
  return checkProtectedFilesystemAccess(path, "write").allowed;
}

export function canExecuteFilesystemPath(path: string) {
  return checkProtectedFilesystemAccess(path, "execute").allowed;
}

export function assertCanReadFilesystemPath(path: string) {
  return requireProtectedFilesystemAccess(path, "read");
}

export function assertCanWriteFilesystemPath(path: string) {
  return requireProtectedFilesystemAccess(path, "write");
}

export function assertCanExecuteFilesystemPath(path: string) {
  return requireProtectedFilesystemAccess(path, "execute");
}
