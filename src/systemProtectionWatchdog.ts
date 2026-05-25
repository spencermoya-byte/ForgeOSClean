import { checkBuilderExecutionAllowed } from "./builderExecutionGuard";
import { checkProtectedFilesystemAccess, type FilesystemAccessKind } from "./protectedFilesystemGuard";
import { checkSearchIndexAccessAllowed, type SearchIndexAccessKind } from "./searchIndexProtectionGuard";
import { checkTerminalExecutionAllowed } from "./terminalExecutionSandbox";
import { isProtectedWorkspacePath } from "./workspaceProtectedPaths";
import { getCurrentWorkspaceProject } from "./workspaceSelectors";

export type SystemProtectionEventKind =
  | "workspace"
  | "filesystem"
  | "builder"
  | "terminal"
  | "search-index";

export type SystemProtectionEvent = {
  allowed: boolean;
  kind: SystemProtectionEventKind;
  path: string;
  reason?: string;
  checkedAt: string;
};

const events: SystemProtectionEvent[] = [];
const MAX_EVENTS = 100;

function recordProtectionEvent(event: Omit<SystemProtectionEvent, "checkedAt">) {
  const next: SystemProtectionEvent = {
    ...event,
    checkedAt: new Date().toISOString(),
  };

  events.unshift(next);
  events.splice(MAX_EVENTS);

  if (typeof window !== "undefined") {
    (window as Window & {
      __VIVUS_SYSTEM_PROTECTION_EVENTS__?: SystemProtectionEvent[];
    }).__VIVUS_SYSTEM_PROTECTION_EVENTS__ = events;

    window.dispatchEvent(new CustomEvent("vivus-system-protection", { detail: next }));
  }

  if (!next.allowed) {
    console.warn(`[Vivus Security] ${next.kind} blocked: ${next.path}`, next.reason);
  }

  return next;
}

export function getSystemProtectionEvents() {
  return [...events];
}

export function checkProtectedWorkspaceRuntime(path: string) {
  const decision = isProtectedWorkspacePath(path);

  return recordProtectionEvent({
    allowed: !decision.protected,
    kind: "workspace",
    path,
    reason: decision.protected ? decision.reason ?? "Protected workspace path denied." : undefined,
  });
}

export function checkProtectedFilesystemRuntime(path: string, accessKind: FilesystemAccessKind) {
  const decision = checkProtectedFilesystemAccess(path, accessKind);

  return recordProtectionEvent({
    allowed: decision.allowed,
    kind: "filesystem",
    path,
    reason: decision.reason,
  });
}

export function checkProtectedBuilderRuntime(path?: string) {
  const decision = checkBuilderExecutionAllowed(path);

  return recordProtectionEvent({
    allowed: decision.allowed,
    kind: "builder",
    path: decision.projectPath,
    reason: decision.reason,
  });
}

export function checkProtectedTerminalRuntime(cwd: string, commandId?: string) {
  const decision = checkTerminalExecutionAllowed({ cwd, commandId });

  return recordProtectionEvent({
    allowed: decision.allowed,
    kind: "terminal",
    path: decision.cwd,
    reason: decision.reason,
  });
}

export function checkProtectedSearchIndexRuntime(path: string | undefined, accessKind: SearchIndexAccessKind) {
  const decision = checkSearchIndexAccessAllowed(path, accessKind);

  return recordProtectionEvent({
    allowed: decision.allowed,
    kind: "search-index",
    path: decision.projectPath,
    reason: decision.reason,
  });
}

function checkActiveWorkspaceProtection() {
  const active = getCurrentWorkspaceProject();
  if (!active) return;

  const path = active.rootPath ?? active.path ?? active.originalPrompt ?? "";
  if (!path) return;

  checkProtectedWorkspaceRuntime(path);
}

export function startSystemProtectionWatchdog() {
  if (typeof window === "undefined") return;

  checkActiveWorkspaceProtection();

  window.addEventListener("vivus-workspace-changed", checkActiveWorkspaceProtection);
  window.addEventListener("vivus-files-refresh", checkActiveWorkspaceProtection);
  window.addEventListener("vivus-preview-refresh", checkActiveWorkspaceProtection);
}
