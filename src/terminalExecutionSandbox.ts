import { checkBuilderExecutionAllowed } from "./builderExecutionGuard";
import { checkProtectedFilesystemAccess } from "./protectedFilesystemGuard";

export type TerminalExecutionRequest = {
  cwd: string;
  commandId?: string;
};

export type TerminalExecutionDecision = {
  allowed: boolean;
  cwd: string;
  commandId: string;
  reason?: string;
};

const ALLOWLISTED_COMMAND_IDS = new Set([
  "git_status",
  "git_diff_stat",
  "npm_build",
]);

export function checkTerminalExecutionAllowed(request: TerminalExecutionRequest): TerminalExecutionDecision {
  const cwd = request.cwd.trim();
  const commandId = request.commandId?.trim() || "raw_command";

  if (!cwd) {
    return {
      allowed: false,
      cwd,
      commandId,
      reason: "Terminal execution requires a working directory.",
    };
  }

  const cwdDecision = checkProtectedFilesystemAccess(cwd, "execute");
  if (!cwdDecision.allowed) {
    return {
      allowed: false,
      cwd,
      commandId,
      reason: cwdDecision.reason ?? "Terminal execution blocked for protected path.",
    };
  }

  const builderDecision = checkBuilderExecutionAllowed(cwd);
  if (!builderDecision.allowed) {
    return {
      allowed: false,
      cwd,
      commandId,
      reason: builderDecision.reason ?? "Terminal execution blocked by Builder execution guard.",
    };
  }

  if (!ALLOWLISTED_COMMAND_IDS.has(commandId)) {
    return {
      allowed: false,
      cwd,
      commandId,
      reason: "Terminal execution is restricted to allowlisted safe command IDs.",
    };
  }

  return {
    allowed: true,
    cwd,
    commandId,
  };
}

export function requireTerminalExecutionAllowed(request: TerminalExecutionRequest) {
  const decision = checkTerminalExecutionAllowed(request);
  if (!decision.allowed) throw new Error(decision.reason ?? "Terminal execution blocked.");
  return decision;
}
