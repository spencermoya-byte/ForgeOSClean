export type ExecutionTaskStatus = "queued" | "running" | "done" | "failed";
export type ExecutionActivityStatus = "pending" | "active" | "done" | "blocked";
export type SafeCommandId = "git_status" | "git_diff_stat" | "npm_build";

export type ExecutionTask = {
  id: string;
  title: string;
  status: ExecutionTaskStatus;
};

export type ExecutionActivity = {
  id: string;
  label: string;
  detail: string;
  status: ExecutionActivityStatus;
};

export type BuilderExecutionResult = {
  backendAvailable: boolean;
  message: string;
  tasks: ExecutionTask[];
  activity: ExecutionActivity[];
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

type TauriExecutionPreview = Partial<BuilderExecutionResult>;
type TauriSafeCommandResult = Partial<SafeCommandResult>;

const safeCommands: Array<{ id: SafeCommandId; label: string }> = [
  { id: "git_status", label: "Git Status" },
  { id: "git_diff_stat", label: "Git Diff Summary" },
  { id: "npm_build", label: "Build Verification" },
];

const fallbackTasks: ExecutionTask[] = [
  { id: "task-1", title: "Analyze the request and convert it into acceptance criteria", status: "done" },
  { id: "task-2", title: "Find the relevant project files and verify current source state", status: "done" },
  { id: "task-3", title: "Apply a minimal implementation patch", status: "queued" },
  { id: "task-4", title: "Run build/type verification", status: "queued" },
  { id: "task-5", title: "Report verified result or stop with failure details", status: "queued" },
];

const fallbackActivity: ExecutionActivity[] = [
  { id: "activity-1", label: "Plan approved", detail: "Build queue accepted by the user.", status: "done" },
  { id: "activity-2", label: "Source verification", detail: "Frontend execution bridge is ready.", status: "done" },
  { id: "activity-3", label: "Local backend", detail: "Waiting for the Tauri command implementation to perform real file edits and terminal commands.", status: "blocked" },
  { id: "activity-4", label: "Verification", detail: "Build verification will run after the local command bridge is connected.", status: "pending" },
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
  if (output) return output;
  return result.ok ? "Command completed with no output." : "Command finished without output details.";
}

function renderSafeCommandResult(container: HTMLElement, result: SafeCommandResult) {
  const existing = container.querySelector(`[data-safe-command-result="${result.commandId}"]`);
  existing?.remove();

  const card = document.createElement("div");
  card.dataset.safeCommandResult = result.commandId;
  card.className = `safe-command-result ${result.blockedReason ? "blocked" : result.ok ? "passed" : "failed"}`;
  card.innerHTML = `
    <div class="safe-command-result-header">
      <span>${safeCommandLabel(result.commandId)}</span>
      <em>${result.blockedReason ? "blocked" : result.ok ? "passed" : "failed"}</em>
    </div>
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
  panel.innerHTML = `
    <strong>Safe local verification</strong>
    <p>Run allowlisted local checks only. Patch execution and arbitrary terminal access remain blocked.</p>
    <div class="safe-command-actions"></div>
    <div class="safe-command-results"></div>
  `;

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

export async function runBuilderExecutionPreview(planSummary: string): Promise<BuilderExecutionResult> {
  if (!hasTauriRuntime()) {
    return normalizeExecutionResult({
      backendAvailable: false,
      message: "Execution bridge is ready in the frontend. Run inside the Tauri shell and connect the vivus_execution_preview command to enable real file and terminal operations.",
    });
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriExecutionPreview>("vivus_execution_preview", { planSummary });
    return normalizeExecutionResult(result);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return normalizeExecutionResult({
      backendAvailable: false,
      message: `Tauri runtime detected, but the local execution command is not connected yet. ${detail}`,
    });
  }
}

export async function runSafeBuilderCommand(commandId: SafeCommandId, projectPath = "."): Promise<SafeCommandResult> {
  if (!hasTauriRuntime()) {
    return normalizeSafeCommandResult(commandId, {
      ok: false,
      commandId,
      commandDisplay: commandId,
      blockedReason: "Safe commands require the Tauri desktop runtime.",
    });
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriSafeCommandResult>("vivus_run_safe_command", {
      request: {
        projectPath,
        commandId,
      },
    });
    return normalizeSafeCommandResult(commandId, result);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return normalizeSafeCommandResult(commandId, {
      ok: false,
      commandId,
      commandDisplay: commandId,
      stderr: detail,
      blockedReason: "Safe command bridge failed before execution.",
    });
  }
}

startSafeVerificationInstaller();
