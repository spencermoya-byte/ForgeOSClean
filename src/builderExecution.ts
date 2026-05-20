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

type TauriExecutionPreview = Partial<BuilderExecutionResult>;
type TauriSafeCommandResult = Partial<SafeCommandResult>;

type TauriProjectTreeResponse = Partial<BuilderProjectTreeResponse>;
type TauriFileInspectionResponse = Partial<BuilderFileInspectionResponse>;

// existing code intentionally preserved...

function hasTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function normalizeProjectTreeResponse(result: TauriProjectTreeResponse | null | undefined): BuilderProjectTreeResponse {
  return {
    ok: Boolean(result?.ok),
    projectPath: result?.projectPath ?? ".",
    relativePath: result?.relativePath ?? "",
    entries: Array.isArray(result?.entries) ? result.entries as BuilderProjectTreeEntry[] : [],
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

export async function listBuilderProjectTree(projectPath = ".", relativePath = ""): Promise<BuilderProjectTreeResponse> {
  if (!hasTauriRuntime()) {
    return normalizeProjectTreeResponse({
      ok: false,
      blockedReason: "Project inspection requires the Tauri desktop runtime.",
    });
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriProjectTreeResponse>("vivus_list_project_tree", {
      request: {
        projectPath,
        relativePath,
      },
    });

    return normalizeProjectTreeResponse(result);
  } catch (error) {
    return normalizeProjectTreeResponse({
      ok: false,
      blockedReason: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function inspectBuilderFile(relativePath: string, projectPath = "."): Promise<BuilderFileInspectionResponse> {
  if (!hasTauriRuntime()) {
    return normalizeFileInspectionResponse({
      ok: false,
      blockedReason: "Project inspection requires the Tauri desktop runtime.",
    });
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const result = await invoke<TauriFileInspectionResponse>("vivus_read_project_file", {
      request: {
        projectPath,
        relativePath,
      },
    });

    return normalizeFileInspectionResponse(result);
  } catch (error) {
    return normalizeFileInspectionResponse({
      ok: false,
      blockedReason: error instanceof Error ? error.message : String(error),
    });
  }
}
