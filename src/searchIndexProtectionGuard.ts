import { checkProtectedFilesystemAccess } from "./protectedFilesystemGuard";
import { checkBuilderExecutionAllowed, resolveBuilderExecutionPath } from "./builderExecutionGuard";

export type SearchIndexAccessKind = "search" | "index" | "watch" | "context" | "repo-map";

export type SearchIndexProtectionDecision = {
  allowed: boolean;
  kind: SearchIndexAccessKind;
  projectPath: string;
  reason?: string;
};

export function checkSearchIndexAccessAllowed(
  projectPath: string | undefined,
  kind: SearchIndexAccessKind,
): SearchIndexProtectionDecision {
  const resolvedPath = resolveBuilderExecutionPath(projectPath);

  if (!resolvedPath.trim()) {
    return {
      allowed: false,
      kind,
      projectPath: resolvedPath,
      reason: "Search/index access requires an active user workspace.",
    };
  }

  const filesystemDecision = checkProtectedFilesystemAccess(resolvedPath, kind === "index" ? "index" : "search");
  if (!filesystemDecision.allowed) {
    return {
      allowed: false,
      kind,
      projectPath: resolvedPath,
      reason: filesystemDecision.reason ?? "Search/index access is blocked for this protected path.",
    };
  }

  const builderDecision = checkBuilderExecutionAllowed(resolvedPath);
  if (!builderDecision.allowed) {
    return {
      allowed: false,
      kind,
      projectPath: resolvedPath,
      reason: builderDecision.reason ?? "Search/index access blocked by Builder guard.",
    };
  }

  return {
    allowed: true,
    kind,
    projectPath: resolvedPath,
  };
}

export function requireSearchIndexAccessAllowed(
  projectPath: string | undefined,
  kind: SearchIndexAccessKind,
) {
  const decision = checkSearchIndexAccessAllowed(projectPath, kind);
  if (!decision.allowed) throw new Error(decision.reason ?? "Search/index access blocked.");
  return decision.projectPath;
}
