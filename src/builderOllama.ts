export type OllamaModelInfo = { name: string; size?: number | null; modified_at?: string | null; };
export type OllamaStatusResponse = { ok: boolean; models: OllamaModelInfo[]; blockedReason?: string | null; degraded?: boolean; recommendedModels?: string[]; };
export type OllamaGenerateResponse = { ok: boolean; model: string; response: string; blockedReason?: string | null; };
const RECOMMENDED_LOCAL_MODELS = ["qwen3-coder:30b","qwen3-vl:32b","qwen3.6:27b"];
export async function getOllamaStatus(): Promise<OllamaStatusResponse> { return { ok:false, models:[], blockedReason:null, degraded:false, recommendedModels:RECOMMENDED_LOCAL_MODELS }; }
export function pickModel(models: OllamaModelInfo[], _role: "planner" | "coder") { return models[0]?.name ?? ""; }
export function describeOllamaStatus(status: OllamaStatusResponse) { return status.ok ? "Local AI ready" : "Local AI unavailable"; }
export async function generateWithOllama(model: string, _prompt: string, _systemPrompt?: string): Promise<OllamaGenerateResponse> { return { ok:false, model, response:"", blockedReason:null }; }
export function extractFullFileResponse(response: string): string | null { return response?.trim() || null; }
