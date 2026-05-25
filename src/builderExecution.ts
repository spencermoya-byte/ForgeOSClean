import { checkBuilderExecutionAllowed } from "./builderExecutionGuard";
import { checkSearchIndexAccessAllowed } from "./searchIndexProtectionGuard";

export type SafeCommandId = "git_status" | "git_diff_stat" | "npm_build";
export type SafeCommandResult = {
  ok: boolean;
  commandId: string;
  commandDisplay: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  blockedReason: string | null;
};

export type BuilderFileCandidate = {
  relativePath: string;
  reason: string;
  score: number;
  sizeBytes: number | null;
};

export type BuilderFileIntelligenceResult = {
  ok: boolean;
  message: string;
  candidates: BuilderFileCandidate[];
  inspectedFiles: any[];
  blockedReason: string | null;
};

export async function runBuilderExecutionPreview(_planSummary: string) {
  const guard = checkBuilderExecutionAllowed();
  return { backendAvailable: guard.allowed, message: guard.reason ?? "Builder ready.", tasks: [], activity: [], diagnostics: [] };
}

export async function runSafeBuilderCommand(commandId: SafeCommandId, _projectPath = "."): Promise<SafeCommandResult> {
  return { ok: false, commandId, commandDisplay: commandId, exitCode: null, stdout: "", stderr: "", durationMs: 0, blockedReason: null };
}

export async function inspectBuilderFile(_relativePath?: string, _projectPath = ".") {
  return { ok: true, content: "", blockedReason: null };
}

export async function runBuilderFileIntelligence(prompt: string, projectPath = "."): Promise<BuilderFileIntelligenceResult> {
  const searchDecision = checkSearchIndexAccessAllowed(projectPath, "index");
  if (!searchDecision.allowed) {
    return { ok: false, message: "Project inspection was blocked by the protection system.", candidates: [], inspectedFiles: [], blockedReason: searchDecision.reason ?? null };
  }

  return { ok: true, message: `Builder intelligence ready for: ${prompt}`, candidates: [], inspectedFiles: [], blockedReason: null };
}
