import { generateWithOllama, getOllamaStatus, pickModel } from "./builderOllama";

export type VivusImplementationPlan = {
  ok: boolean;
  model: string;
  summary: string;
  targetIntent: string;
  allowedChanges: string[];
  blockedChanges: string[];
  acceptanceCriteria: string[];
  verificationPlan: string[];
  rawPlan: string;
  blockedReason: string | null;
};

const FALLBACK_ALLOWED_CHANGES = [
  "Modify only files required by the approved user request.",
  "Use minimal safe patches and preserve existing working behavior.",
  "Run build verification after applying changes.",
];

const FALLBACK_BLOCKED_CHANGES = [
  "Do not perform unrelated redesigns or broad refactors.",
  "Do not remove existing routes, panels, or working user flows.",
  "Do not claim success unless verification passes.",
];

const FALLBACK_ACCEPTANCE = [
  "The requested behavior is implemented in the app.",
  "No unrelated behavior regresses.",
  "Build verification passes or the change is rolled back.",
];

const FALLBACK_VERIFICATION = [
  "Create rollback checkpoint before applying edits.",
  "Apply the generated patch only after diff preview approval.",
  "Run the configured build verification command.",
  "Attempt one diagnostic-driven repair pass if verification fails.",
];

function coerceStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value.map((item) => String(item).trim()).filter(Boolean);
  return cleaned.length ? cleaned : fallback;
}

function extractJsonObject(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const source = fenced || text.trim();
  const first = source.indexOf("{");
  const last = source.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  return source.slice(first, last + 1);
}

function fallbackPlan(userRequest: string, reason: string): VivusImplementationPlan {
  return {
    ok: false,
    model: "fallback",
    summary: userRequest.trim(),
    targetIntent: userRequest.trim(),
    allowedChanges: FALLBACK_ALLOWED_CHANGES,
    blockedChanges: FALLBACK_BLOCKED_CHANGES,
    acceptanceCriteria: FALLBACK_ACCEPTANCE,
    verificationPlan: FALLBACK_VERIFICATION,
    rawPlan: "",
    blockedReason: reason,
  };
}

function plannerPrompt(userRequest: string) {
  return `You are the Vivus local planning model. Convert the user's request into a strict implementation plan for a local AI IDE coding agent.\n\nReturn only JSON with this exact shape:\n{\n  "summary": "one concise implementation summary",\n  "targetIntent": "what the user actually wants built or changed",\n  "allowedChanges": ["specific allowed code changes"],\n  "blockedChanges": ["specific changes the coder must not make"],\n  "acceptanceCriteria": ["objective success checks"],\n  "verificationPlan": ["verification steps after patching"]\n}\n\nRules:\n- Preserve existing architecture.\n- No broad refactors unless directly required.\n- Prefer minimal multi-file edits when needed.\n- Include build verification.\n- Include rollback if verification fails.\n- Do not mention cloud AI.\n- Keep the plan concise and executable.\n\nUser request:\n${userRequest}`;
}

export function planToCoderSummary(plan: VivusImplementationPlan) {
  return [
    `Planner model: ${plan.model}`,
    `Summary: ${plan.summary}`,
    `Target intent: ${plan.targetIntent}`,
    "Allowed changes:",
    ...plan.allowedChanges.map((item) => `- ${item}`),
    "Blocked changes:",
    ...plan.blockedChanges.map((item) => `- ${item}`),
    "Acceptance criteria:",
    ...plan.acceptanceCriteria.map((item) => `- ${item}`),
    "Verification plan:",
    ...plan.verificationPlan.map((item) => `- ${item}`),
  ].join("\n");
}

export async function createVivusImplementationPlan(userRequest: string): Promise<VivusImplementationPlan> {
  const trimmed = userRequest.trim();
  if (!trimmed) return fallbackPlan(userRequest, "Planner received an empty request.");

  const status = await getOllamaStatus();
  if (!status.ok || status.models.length === 0) {
    return fallbackPlan(trimmed, status.blockedReason ?? "Ollama planner status unavailable.");
  }

  const model = pickModel(status.models, "planner");
  if (!model) return fallbackPlan(trimmed, "No planner model is installed.");

  const result = await generateWithOllama(
    model,
    plannerPrompt(trimmed),
    "You are Vivus planner. You return only compact valid JSON. No markdown, no commentary.",
  );

  if (!result.ok) return fallbackPlan(trimmed, result.blockedReason ?? `${model} planner generation failed.`);

  const jsonText = extractJsonObject(result.response);
  if (!jsonText) return fallbackPlan(trimmed, `${model} returned no parseable JSON plan.`);

  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    return {
      ok: true,
      model,
      summary: String(parsed.summary || trimmed).trim(),
      targetIntent: String(parsed.targetIntent || trimmed).trim(),
      allowedChanges: coerceStringArray(parsed.allowedChanges, FALLBACK_ALLOWED_CHANGES),
      blockedChanges: coerceStringArray(parsed.blockedChanges, FALLBACK_BLOCKED_CHANGES),
      acceptanceCriteria: coerceStringArray(parsed.acceptanceCriteria, FALLBACK_ACCEPTANCE),
      verificationPlan: coerceStringArray(parsed.verificationPlan, FALLBACK_VERIFICATION),
      rawPlan: result.response,
      blockedReason: null,
    };
  } catch (error) {
    return fallbackPlan(trimmed, error instanceof Error ? error.message : String(error));
  }
}
