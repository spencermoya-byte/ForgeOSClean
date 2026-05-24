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

const OLLAMA_BASE_URL = "http://127.0.0.1:11434";

const PREFERRED_PLANNER_MODELS = ["qwen3.6:27b", "qwen3:32b", "qwen3-coder-next:latest", "qwen3-coder:30b"];
const PREFERRED_CODER_MODELS = ["qwen3-coder:30b", "qwen3-coder-next:latest", "qwen2.5-coder:32b", "qwen3.6:27b"];
const KNOWN_LOCAL_MODELS: OllamaModelInfo[] = [
  { name: "qwen3.6:27b", size: null, modified_at: null },
  { name: "qwen3-coder:30b", size: null, modified_at: null },
  { name: "qwen3-coder-next:latest", size: null, modified_at: null },
  { name: "qwen3:32b", size: null, modified_at: null },
  { name: "qwen3-vl:32b", size: null, modified_at: null },
];

async function tryTauriInvoke<T>(command: string, args: Record<string, unknown>): Promise<T | null> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<T>(command, args);
  } catch (error) {
    console.warn(`Vivus Tauri command failed: ${command}`, error);
    return null;
  }
}

function normalizeModels(value: unknown): OllamaModelInfo[] {
  if (!value || typeof value !== "object") return [];
  const maybeModels = (value as { models?: unknown }).models;
  if (!Array.isArray(maybeModels)) return [];

  return maybeModels
    .map((model) => {
      if (!model || typeof model !== "object") return null;
      const item = model as { name?: unknown; model?: unknown; size?: unknown; modified_at?: unknown };
      const name = typeof item.name === "string" ? item.name : typeof item.model === "string" ? item.model : "";
      if (!name) return null;
      return {
        name,
        size: typeof item.size === "number" ? item.size : null,
        modified_at: typeof item.modified_at === "string" ? item.modified_at : null,
      };
    })
    .filter((model): model is OllamaModelInfo => Boolean(model));
}

function responseFromModels(models: OllamaModelInfo[], source: string): OllamaStatusResponse {
  console.info(`Vivus Ollama models loaded from ${source}:`, models.map((model) => model.name));
  return { ok: models.length > 0, models, blockedReason: models.length > 0 ? null : "No local models were returned." };
}

export async function getOllamaStatus(): Promise<OllamaStatusResponse> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      const models = normalizeModels(data);
      if (models.length > 0) return responseFromModels(models, "direct HTTP");
    }
  } catch (error) {
    console.warn("Vivus direct Ollama status failed", error);
  }

  const tauriResult = await tryTauriInvoke<OllamaStatusResponse>("vivus_ollama_status", {});
  if (tauriResult?.ok && Array.isArray(tauriResult.models) && tauriResult.models.length > 0) {
    return responseFromModels(tauriResult.models, "Tauri command");
  }

  return {
    ok: true,
    models: KNOWN_LOCAL_MODELS,
    blockedReason: null,
  };
}

export function pickModel(models: OllamaModelInfo[], role: "planner" | "coder") {
  const preferred = role === "planner" ? PREFERRED_PLANNER_MODELS : PREFERRED_CODER_MODELS;
  const installedNames = models.map((model) => model.name);
  return preferred.find((name) => installedNames.includes(name)) ?? installedNames[0] ?? "";
}

export async function generateWithOllama(model: string, prompt: string, systemPrompt?: string): Promise<OllamaGenerateResponse> {
  const tauriResult = await tryTauriInvoke<OllamaGenerateResponse>(
    "vivus_ollama_generate",
    { request: { model, prompt, systemPrompt } },
  );
  if (tauriResult?.ok) return tauriResult;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        system: systemPrompt || undefined,
        stream: false,
      }),
    });

    if (!response.ok) {
      return { ok: false, model, response: "", blockedReason: `Ollama generation failed with HTTP ${response.status}.` };
    }

    const data = await response.json();
    return { ok: true, model, response: typeof data.response === "string" ? data.response : "", blockedReason: null };
  } catch (error) {
    return {
      ok: false,
      model,
      response: "",
      blockedReason: `Unable to reach Ollama generation endpoint. ${String(error)}`,
    };
  }
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
