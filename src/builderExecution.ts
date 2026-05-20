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
