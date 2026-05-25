export type OllamaModelInfo = {
  name: string;
  size?: number | null;
  modified_at?: string | null;
};

export type OllamaStatusResponse = {
  ok: boolean;
  models: OllamaModelInfo[];
  blockedReason?: string | null;
  degraded?: boolean;
  recommendedModels?: string[];
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
const RECOMMENDED_LOCAL_MODELS = Array.from(new Set([...PREFERRED_CODER_MODELS, ...PREFERRED_PLANNER_MODELS, "qwen3-vl:32b"]));

const EXPLANATION_PREFIXES = ["here","sure","i updated","i changed","explanation","the following","updated file"];

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
    .map((model): OllamaModelInfo | null => {
      if (!model || typeof model !== "object") return null;

      const item = model as {
        name?: unknown;
        model?: unknown;
        size?: unknown;
        modified_at?: unknown;
      };

      const name =
        typeof item.name === "string"
          ? item.name
          : typeof item.model === "string"
          ? item.model
          : "";

      if (!name) return null;

      return {
        name,
        size: typeof item.size === "number" ? item.size : null,
        modified_at:
          typeof item.modified_at === "string"
            ? item.modified_at
            : null,
      };
    })
    .filter((model): model is OllamaModelInfo => model !== null);
}

function responseFromModels(models: OllamaModelInfo[], source: string): OllamaStatusResponse {
  console.info(`Vivus Ollama models loaded from ${source}:`, models.map((model) => model.name));
  return {
    ok: models.length > 0,
    models,
    blockedReason: models.length > 0 ? null : "No local models were returned.",
    degraded: false,
    recommendedModels: RECOMMENDED_LOCAL_MODELS,
  };
}

export async function getOllamaStatus(): Promise<OllamaStatusResponse> {
  let directFailure = "";

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      const models = normalizeModels(data);
      if (models.length > 0) return responseFromModels(models, "direct HTTP");
      directFailure = "Ollama responded, but no local models were returned.";
    } else {
      directFailure = `Ollama status failed with HTTP ${response.status}.`;
    }
  } catch (error) {
    directFailure = `Unable to reach Ollama at ${OLLAMA_BASE_URL}. ${String(error)}`;
    console.warn("Vivus direct Ollama status failed", error);
  }

  const tauriResult = await tryTauriInvoke<OllamaStatusResponse>("vivus_ollama_status", {});
  if (tauriResult?.ok && Array.isArray(tauriResult.models) && tauriResult.models.length > 0) {
    return responseFromModels(tauriResult.models, "Tauri command");
  }

  return {
    ok: false,
    models: [],
    blockedReason:
      tauriResult?.blockedReason ??
      (directFailure ??
        "No local Ollama models are available. Start Ollama and install a recommended local coder model."),
    degraded: true,
    recommendedModels: RECOMMENDED_LOCAL_MODELS,
  };
}

export function pickModel(models: OllamaModelInfo[], role: "planner" | "coder") {
  const preferred = role === "planner" ? PREFERRED_PLANNER_MODELS : PREFERRED_CODER_MODELS;
  const installedNames = models.map((model) => model.name);
  return preferred.find((name) => installedNames.includes(name)) ?? installedNames[0] ?? "";
}

export function describeOllamaStatus(status: OllamaStatusResponse) {
  if (status.ok && status.models.length > 0) {
    return `Local AI ready: ${status.models.length} model${status.models.length === 1 ? "" : "s"} detected.`;
  }

  const recommended = status.recommendedModels?.slice(0, 3).join(", ") || "qwen3-coder:30b";
  return `${status.blockedReason ?? "Local AI is unavailable."} Recommended: ${recommended}.`;
}

export async function generateWithOllama(model: string, prompt: string, systemPrompt?: string): Promise<OllamaGenerateResponse> {
  if (!model.trim()) {
    return {
      ok: false,
      model,
      response: "",
      blockedReason: "No local model is selected. Start Ollama and install a recommended coder model.",
    };
  }

  const tauriResult = await tryTauriInvoke<OllamaGenerateResponse>("vivus_ollama_generate", { request: { model, prompt, systemPrompt } });
  if (tauriResult?.ok) return tauriResult;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, system: systemPrompt || undefined, stream: false }),
    });

    if (!response.ok) {
      return { ok: false, model, response: "", blockedReason: `Ollama generation failed with HTTP ${response.status}.` };
    }

    const data = await response.json();
    return { ok: true, model, response: typeof data.response === "string" ? data.response : "", blockedReason: null };
  } catch (error) {
    return { ok: false, model, response: "", blockedReason: `Unable to reach Ollama generation endpoint. ${String(error)}` };
  }
}

function hasExplanationContamination(candidate: string) {
  const lower = candidate.trim().toLowerCase();
  if (EXPLANATION_PREFIXES.some((prefix) => lower.startsWith(prefix))) return true;
  const firstLine = lower.split(/\r?\n/, 1)[0]?.trim() ?? "";
  return /^#+\s/.test(firstLine) || /^[-*]\s/.test(firstLine) || firstLine.startsWith("target file:") || firstLine.startsWith("file:") || firstLine.startsWith("changes made") || firstLine.startsWith("this patch") || lower.includes("\nexplanation:") || lower.includes("\nchanges made:") || lower.includes("\n```");
}

function isPlausibleFileContent(candidate: string) {
  const trimmed = candidate.trim();
  if (trimmed.length < 24) return false;
  if (trimmed.includes("```")) return false;
  if (hasExplanationContamination(trimmed)) return false;
  return true;
}

function extractTaggedFullFile(response: string) {
  const matches = [...response.matchAll(/<FULL_FILE>([\s\S]*?)<\/FULL_FILE>/gi)].map((match) => match[1]?.trim() ?? "").filter(Boolean);
  if (matches.length !== 1) return null;
  const candidate = matches[0];
  return isPlausibleFileContent(candidate) ? candidate : null;
}

function extractSingleCodeBlock(response: string) {
  const matches = [...response.matchAll(/```(?:tsx|ts|jsx|js|css|rust|rs|json)?\s*([\s\S]*?)```/gi)].map((match) => match[1]?.trim() ?? "").filter(Boolean);
  if (matches.length !== 1) return null;
  const candidate = matches[0];
  return isPlausibleFileContent(candidate) ? candidate : null;
}

export function extractFullFileResponse(response: string): string | null {
  const trimmed = response.trim();
  if (!trimmed) return null;
  const tagged = extractTaggedFullFile(trimmed);
  if (tagged) return tagged;
  if (/<\/?FULL_FILE>/i.test(trimmed)) return null;
  const codeBlock = extractSingleCodeBlock(trimmed);
  if (codeBlock) return codeBlock;
  if (/```/.test(trimmed)) return null;
  return isPlausibleFileContent(trimmed) ? trimmed : null;
}
