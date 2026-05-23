export type OllamaModelInfo = {
  name: string;
  size?: number | null;
  modified_at?: string | null;
};

export type OllamaStatusResponse = {
  ok: boolean;
  models: OllamaModelInfo[];
  blockedReason?: string | null;
};

export type OllamaGenerateResponse = {
  ok: boolean;
  model: string;
  response: string;
  blockedReason?: string | null;
};

const PREFERRED_PLANNER_MODELS = ["qwen3.6:27b", "qwen3:32b", "qwen3-coder-next:latest", "qwen3-coder:30b"];
const PREFERRED_CODER_MODELS = ["qwen3-coder:30b", "qwen3-coder-next:latest", "qwen2.5-coder:32b", "qwen3.6:27b"];

async function invokeOrFallback<T>(command: string, args: Record<string, unknown>, fallback: T): Promise<T> {
  const hasTauriRuntime = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

  if (!hasTauriRuntime) {
    return fallback;
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(command, args);
  } catch (error) {
    console.warn(`Vivus Ollama command failed: ${command}`, error);
    return fallback;
  }
}

export async function getOllamaStatus(): Promise<OllamaStatusResponse> {
  return invokeOrFallback<OllamaStatusResponse>(
    "vivus_ollama_status",
    {},
    {
      ok: false,
      models: [],
      blockedReason: "Ollama status requires the Tauri runtime.",
    },
  );
}

export function pickModel(models: OllamaModelInfo[], role: "planner" | "coder") {
  const preferred = role === "planner" ? PREFERRED_PLANNER_MODELS : PREFERRED_CODER_MODELS;
  const installedNames = models.map((model) => model.name);
  return preferred.find((name) => installedNames.includes(name)) ?? installedNames[0] ?? "";
}

export async function generateWithOllama(model: string, prompt: string, systemPrompt?: string): Promise<OllamaGenerateResponse> {
  return invokeOrFallback<OllamaGenerateResponse>(
    "vivus_ollama_generate",
    { request: { model, prompt, systemPrompt } },
    {
      ok: false,
      model,
      response: "",
      blockedReason: "Ollama generation requires the Tauri runtime.",
    },
  );
}

export function extractFullFileResponse(response: string): string | null {
  const trimmed = response.trim();
  const codeBlock = trimmed.match(/```(?:tsx|ts|jsx|js|css|rust|rs)?\s*([\s\S]*?)```/i);
  const content = (codeBlock?.[1] ?? trimmed).trim();

  if (!content) return null;
  if (content.includes("<FULL_FILE>") && content.includes("</FULL_FILE>")) {
    return content.split("<FULL_FILE>")[1]?.split("</FULL_FILE>")[0]?.trim() ?? null;
  }

  return content;
}
