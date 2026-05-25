import { checkBuilderExecutionAllowed, resolveBuilderExecutionPath } from "./builderExecutionGuard";
import { assertCanReadFilesystemPath } from "./protectedFilesystemGuard";
import { checkSearchIndexAccessAllowed } from "./searchIndexProtectionGuard";
import { checkTerminalExecutionAllowed } from "./terminalExecutionSandbox";

export type ExecutionTaskStatus = "queued" | "running" | "done" | "failed";
export type ExecutionActivityStatus = "pending" | "active" | "done" | "blocked";
export type SafeCommandId = "git_status" | "git_diff_stat" | "npm_build";

export type ExecutionTask = { id: string; title: string; status: ExecutionTaskStatus };
export type ExecutionActivity = { id: string; label: string; detail: string; status: ExecutionActivityStatus };
export type BuildDiagnostic = { file: string | null; line: number | null; column: number | null; code: string | null; message: string };

export type BuilderExecutionResult = {
  backendAvailable: boolean;
  message: string;
  tasks: ExecutionTask[];
  activity: ExecutionActivity[];
  diagnostics: BuildDiagnostic[];
};

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

export type BuilderProjectTreeEntry = {
  name: string;
  relativePath: string;
  entryType: "file" | "directory";
  sizeBytes: number | null;
};

export type BuilderProjectTreeResponse = {
  ok: boolean;
  projectPath: string;
  relativePath: string;
  entries: BuilderProjectTreeEntry[];
  blockedReason: string | null;
};

export type BuilderFileInspectionResponse = {
  ok: boolean;
  projectPath: string;
  relativePath: string;
  sizeBytes: number | null;
  content: string;
  truncated: boolean;
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
  inspectedFiles: BuilderFileInspectionResponse[];
  blockedReason: string | null;
};

type TauriExecutionPreview = Partial<BuilderExecutionResult>;
type TauriSafeCommandResult = Partial<SafeCommandResult>;
type TauriProjectTreeResponse = Partial<BuilderProjectTreeResponse>;
type TauriFileInspectionResponse = Partial<BuilderFileInspectionResponse>;

const safeCommands: Array<{ id: SafeCommandId; label: string }> = [
  { id: "git_status", label: "Git Status" },
  { id: "git_diff_stat", label: "Git Diff Summary" },
  { id: "npm_build", label: "Build Verification" },
];

const importantSourceNames = ["app.tsx", "app.ts", "main.tsx", "main.ts", "index.tsx", "index.ts", "app.css", "index.css", "package.json", "cargo.toml"];
const sourceExtensions = [".ts", ".tsx", ".js", ".jsx", ".css", ".rs", ".json", ".toml"];

const fallbackTasks: ExecutionTask[] = [
  { id: "task-1", title: "Analyze the request and convert it into acceptance criteria", status: "done" },
  { id: "task-2", title: "Find the relevant project files and verify current source state", status: "done" },
  { id: "task-3", title: "Apply a minimal implementation patch", status: "queued" },
  { id: "task-4", title: "Run build/type verification", status: "queued" },
  { id: "task-5", title: "Report verified result or stop with failure details", status: "queued" },
];

const fallbackActivity: ExecutionActivity[] = [
  { id: "activity-1", label: "Plan approved", detail: "Build queue accepted by the user.", status: "done" },
  { id: "activity-2", label: "Source verification", detail: "Builder protection guards are active.", status: "done" },
  { id: "activity-3", label: "Local backend", detail: "Real edits require the protected Tauri execution bridge.", status: "blocked" },
  { id: "activity-4", label: "Verification", detail: "Build verification will run through allowlisted commands only.", status: "pending" },
];

function hasTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function normalizeExecutionResult(result: TauriExecutionPreview | null | undefined): BuilderExecutionResult {
  return {
    backendAvailable: Boolean(result?.backendAvailable),
    message: result?.message ?? "Execution bridge completed with fallback status.",
    tasks: result?.tasks?.length ? result.tasks : fallbackTasks,
    activity: result?.activity?.length ? result.activity : fallbackActivity,
    diagnostics: Array.isArray(result?.diagnostics) ? (result.diagnostics as BuildDiagnostic[]) : [],
  };
}

function normalizeSafeCommandResult(commandId: SafeCommandId, result: TauriSafeCommandResult | null | undefined): SafeCommandResult {
  return {
    ok: Boolean(result?.ok),
    commandId: result?.commandId ?? commandId,
    commandDisplay: result?.commandDisplay ?? commandId,
    exitCode: typeof result?.exitCode === "number" ? result.exitCode : null,
    stdout: result?.stdout ?? "",
    stderr: result?.stderr ?? "",
    durationMs: typeof result?.durationMs === "number" ? result.durationMs : 0,
    blockedReason: result?.blockedReason ?? null,
  };
}

function normalizeProjectTreeResponse(result: TauriProjectTreeResponse | null | undefined): BuilderProjectTreeResponse {
  return {
    ok: Boolean(result?.ok),
    projectPath: result?.projectPath ?? ".",
    relativePath: result?.relativePath ?? "",
    entries: Array.isArray(result?.entries) ? (result.entries as BuilderProjectTreeEntry[]) : [],
    blockedReason: result?.blockedReason ?? null,
  };
}

function normalizeFileInspectionResponse(result: TauriFileInspectionResponse | null | undefined): BuilderFileInspectionResponse {
  return {
    ok: Boolean(result?.ok),
    projectPath: result?.projectPath ?? ".",
    relativePath: result?.relativePath ?? "",
    sizeBytes: typeof result?.sizeBytes === "number" ? result.sizeBytes : null,
    content: result?.content ?? "",
    truncated: Boolean(result?.truncated),
    blockedReason: result?.blockedReason ?? null,
  };
}

function joinProjectPath(projectPath: string, relativePath: string) {
  return `${projectPath.replace(/\\+/g, "/").replace(/\/+$/, "")}/${relativePath.replace(/^\/+/, "")}`;
}

function blockedExecutionResult(reason: string): BuilderExecutionResult {
  return normalizeExecutionResult({
    backendAvailable: false,
    message: reason,
    tasks: fallbackTasks.map((task) => task.id === "task-2" ? { ...task, status: "failed" } : task),
    activity: [
      { id: "activity-security", label: "Security boundary", detail: reason, status: "blocked" },
      ...fallbackActivity,
    ],
  });
}

function safeCommandLabel(commandId: string) {
  return safeCommands.find((command) => command.id === commandId)?.label ?? commandId;
}

function compactSafeCommandOutput(result: SafeCommandResult) {
  const blocked = result.blockedReason ? `Blocked: ${result.blockedReason}` : "";
  const output = [result.stderr, result.stdout]
    .filter(Boolean)
    .join("\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6)
    .join("\n");
  if (blocked && output) return `${blocked}\n${output}`;
  if (blocked) return blocked;
  return output || (result.ok ? "Command completed with no output." : "Command finished without output details.");
}

function renderSafeCommandResult(container: HTMLElement, result: SafeCommandResult) {
  const existing = container.querySelector(`[data-safe-command-result="${result.commandId}"]`);
  existing?.remove();
  const card = document.createElement("div");
  card.dataset.safeCommandResult = result.commandId;
  card.className = `safe-command-result ${result.blockedReason ? "blocked" : result.ok ? "passed" : "failed"}`;
  card.innerHTML = `
    <div class="safe-command-result-header"><span>${safeCommandLabel(result.commandId)}</span><em>${result.blockedReason ? "blocked" : result.ok ? "passed" : "failed"}</em></div>
    <code>${result.commandDisplay}</code>
    <small>Exit: ${typeof result.exitCode === "number" ? result.exitCode : "n/a"} · ${result.durationMs}ms</small>
    <pre>${compactSafeCommandOutput(result)}</pre>
  `;
  container.prepend(card);
}

function installSafeVerificationPanel() {
  if (typeof document === "undefined") return;
  const workflow = document.querySelector(".builder-workflow-panel");
  const actions = document.querySelector(".builder-workflow-actions");
  if (!workflow || !actions || document.querySelector(".builder-verification-section")) return;

  const panel = document.createElement("div");
  panel.className = "builder-plan-section builder-verification-section";
  panel.innerHTML = `<strong>Safe local verification</strong><p>Run allowlisted local checks only. Protected Vivus app/runtime paths are denied.</p><div class="safe-command-actions"></div><div class="safe-command-results"></div>`;

  const buttonWrap = panel.querySelector(".safe-command-actions");
  const results = panel.querySelector(".safe-command-results") as HTMLElement | null;
  if (!buttonWrap || !results) return;

  safeCommands.forEach((command) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = command.label;
    button.addEventListener("click", async () => {
      if (button.dataset.running === "true") return;
      button.dataset.running = "true";
      const original = button.textContent;
      button.textContent = "Running...";
      const result = await runSafeBuilderCommand(command.id, ".");
      renderSafeCommandResult(results, result);
      button.textContent = original;
      button.dataset.running = "false";
    });
    buttonWrap.appendChild(button);
  });

  actions.parentElement?.insertBefore(panel, actions);
}

function startSafeVerificationInstaller() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const install = () => window.setTimeout(installSafeVerificationPanel, 0);
  install();
  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}

function scoreCandidate(entry: BuilderProjectTreeEntry, prompt: string) {
  const path = entry.relativePath.toLowerCase();
  const name = entry.name.toLowerCase();
  const words = prompt.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);
  let score = 0;
  const reasons: string[] = [];
  if (entry.entryType !== "file") return null;
  if (!sourceExtensions.some((extension) => path.endsWith(extension))) return null;
  if (importantSourceNames.includes(name)) { score += 20; reasons.push("core project file"); }
  if (path.startsWith("src/")) { score += 10; reasons.push("inside src/"); }
  for (const word of words) {
    if (path.includes(word)) { score += 4; reasons.push(`path matches \"${word}\"`); }
  }
  if (entry.sizeBytes && entry.sizeBytes > 220_000) { score -= 10; reasons.push("large file; lower priority"); }
  if (score <= 0) return null;
  return { relativePath: entry.relativePath, reason: Array.from(new Set(reasons)).join(", "), score, sizeBytes: entry.sizeBytes } satisfies BuilderFileCandidate;
}

export async function runBuilderExecutionPreview(planSummary: string): Promise<BuilderExecutionResult> {
  const guard = checkBuilderExecutionAllowed();
  if (!guard.allowed) return blockedExecutionResult(guard.reason ?? "Builder execution blocked.");

  if (!hasTauriRuntime()) {
    return normalizeExecutionResult({
      backendAvailable: false,
      message: "Execution bridge is ready in the frontend. Run inside the Tauri shell and connect the protected execution command to enable real file operations.",
    });
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriExecutionPreview>("vivus_execution_preview", {
      planSummary,
      projectPath: guard.projectPath,
    });
    return normalizeExecutionResult(result);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return normalizeExecutionResult({ backendAvailable: false, message: `Tauri execution bridge is not connected yet. ${detail}` });
  }
}

export async function runSafeBuilderCommand(commandId: SafeCommandId, projectPath = "."): Promise<SafeCommandResult> {
  const resolvedProjectPath = resolveBuilderExecutionPath(projectPath);
  const terminalDecision = checkTerminalExecutionAllowed({ cwd: resolvedProjectPath, commandId });
  if (!terminalDecision.allowed) {
    return normalizeSafeCommandResult(commandId, {
      ok: false,
      commandId,
      commandDisplay: commandId,
      blockedReason: terminalDecision.reason ?? "Safe command blocked by terminal sandbox.",
    });
  }

  if (!hasTauriRuntime()) {
    return normalizeSafeCommandResult(commandId, { ok: false, commandId, commandDisplay: commandId, blockedReason: "Safe commands require the Tauri desktop runtime." });
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriSafeCommandResult>("vivus_run_safe_command", {
      request: { projectPath: resolvedProjectPath, commandId },
    });
    return normalizeSafeCommandResult(commandId, result);
  } catch (error) {
    return normalizeSafeCommandResult(commandId, {
      ok: false,
      commandId,
      commandDisplay: commandId,
      stderr: error instanceof Error ? error.message : String(error),
      blockedReason: "Safe command bridge failed before execution.",
    });
  }
}

export async function listBuilderProjectTree(projectPath = ".", relativePath = ""): Promise<BuilderProjectTreeResponse> {
  const searchDecision = checkSearchIndexAccessAllowed(projectPath, "repo-map");
  if (!searchDecision.allowed) {
    return normalizeProjectTreeResponse({ ok: false, projectPath: searchDecision.projectPath, relativePath, blockedReason: searchDecision.reason });
  }

  if (!hasTauriRuntime()) return normalizeProjectTreeResponse({ ok: false, blockedReason: "Project inspection requires the Tauri desktop runtime." });

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriProjectTreeResponse>("vivus_list_project_tree", {
      request: { projectPath: searchDecision.projectPath, relativePath },
    });
    return normalizeProjectTreeResponse(result);
  } catch (error) {
    return normalizeProjectTreeResponse({ ok: false, projectPath: searchDecision.projectPath, relativePath, blockedReason: error instanceof Error ? error.message : String(error) });
  }
}

export async function inspectBuilderFile(relativePath: string, projectPath = "."): Promise<BuilderFileInspectionResponse> {
  const resolvedProjectPath = resolveBuilderExecutionPath(projectPath);
  const searchDecision = checkSearchIndexAccessAllowed(resolvedProjectPath, "context");
  if (!searchDecision.allowed) {
    return normalizeFileInspectionResponse({ ok: false, projectPath: searchDecision.projectPath, relativePath, blockedReason: searchDecision.reason });
  }

  try {
    assertCanReadFilesystemPath(joinProjectPath(searchDecision.projectPath, relativePath));
  } catch (error) {
    return normalizeFileInspectionResponse({ ok: false, projectPath: searchDecision.projectPath, relativePath, blockedReason: error instanceof Error ? error.message : String(error) });
  }

  if (!hasTauriRuntime()) return normalizeFileInspectionResponse({ ok: false, projectPath: searchDecision.projectPath, relativePath, blockedReason: "Project inspection requires the Tauri desktop runtime." });

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriFileInspectionResponse>("vivus_read_project_file", {
      request: { projectPath: searchDecision.projectPath, relativePath },
    });
    return normalizeFileInspectionResponse(result);
  } catch (error) {
    return normalizeFileInspectionResponse({ ok: false, projectPath: searchDecision.projectPath, relativePath, blockedReason: error instanceof Error ? error.message : String(error) });
  }
}

export async function runBuilderFileIntelligence(prompt: string, projectPath = "."): Promise<BuilderFileIntelligenceResult> {
  const searchDecision = checkSearchIndexAccessAllowed(projectPath, "index");
  if (!searchDecision.allowed) {
    return { ok: false, message: "Project inspection was blocked by the protection system.", candidates: [], inspectedFiles: [], blockedReason: searchDecision.reason ?? null };
  }

  const root = await listBuilderProjectTree(searchDecision.projectPath);
  if (!root.ok) return { ok: false, message: "Project tree inspection was blocked.", candidates: [], inspectedFiles: [], blockedReason: root.blockedReason };

  const src = await listBuilderProjectTree(searchDecision.projectPath, "src");
  const allEntries = [...root.entries, ...(src.ok ? src.entries : [])];
  const candidates = allEntries
    .map((entry) => scoreCandidate(entry, prompt))
    .filter((candidate): candidate is BuilderFileCandidate => Boolean(candidate))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const inspectedFiles: BuilderFileInspectionResponse[] = [];
  for (const candidate of candidates.slice(0, 4)) inspectedFiles.push(await inspectBuilderFile(candidate.relativePath, searchDecision.projectPath));

  return {
    ok: true,
    message: candidates.length ? `Identified ${candidates.length} candidate file${candidates.length === 1 ? "" : "s"}. File editing remains disabled until protected patch execution is connected.` : "Project inspection completed, but no strong file candidates were found.",
    candidates,
    inspectedFiles,
    blockedReason: null,
  };
}

startSafeVerificationInstaller();
