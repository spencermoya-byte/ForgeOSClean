export type BuilderTaskPhase = {
  id: string;
  title: string;
  prompt: string;
  required: boolean;
};

export type BuilderTaskDecomposition = {
  originalRequest: string;
  phases: BuilderTaskPhase[];
  mode: "single-phase" | "multi-phase";
};

const FEATURE_WORDS = ["build", "create", "add", "implement", "integrate", "wire", "system", "workflow"];
const STYLE_WORDS = ["style", "layout", "responsive", "ui", "ux", "polish", "spacing", "design"];
const BACKEND_WORDS = ["backend", "tauri", "rust", "command", "filesystem", "terminal", "process"];
const VERIFY_WORDS = ["verify", "test", "fix", "debug", "broken", "error", "not working"];

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function makePhase(id: string, title: string, prompt: string, required = true): BuilderTaskPhase {
  return { id, title, prompt, required };
}

export function decomposeBuilderTask(request: string): BuilderTaskDecomposition {
  const trimmed = request.trim();
  const text = trimmed.toLowerCase();
  const phases: BuilderTaskPhase[] = [];

  const complex =
    trimmed.length > 180 ||
    [FEATURE_WORDS, STYLE_WORDS, BACKEND_WORDS, VERIFY_WORDS].filter((group) => hasAny(text, group)).length >= 2;

  if (!complex) {
    return {
      originalRequest: trimmed,
      phases: [makePhase("single", "Implement request", trimmed)],
      mode: "single-phase",
    };
  }

  phases.push(makePhase("scope", "Scope and wire core behavior", `${trimmed}\n\nFocus only on the core behavior and required source wiring.`));

  if (hasAny(text, STYLE_WORDS)) {
    phases.push(makePhase("ui", "Apply UI and layout changes", `${trimmed}\n\nFocus only on UI, layout, styling, responsiveness, and visible UX behavior.`));
  }

  if (hasAny(text, BACKEND_WORDS)) {
    phases.push(makePhase("backend", "Apply backend/runtime changes", `${trimmed}\n\nFocus only on backend, Tauri, filesystem, terminal, runtime, or command wiring.`));
  }

  phases.push(makePhase("verify", "Verify and repair", `${trimmed}\n\nFocus only on verification, build correctness, regressions, and repair of diagnostics.`));

  return {
    originalRequest: trimmed,
    phases,
    mode: phases.length > 1 ? "multi-phase" : "single-phase",
  };
}

export function summarizeBuilderTaskDecomposition(decomposition: BuilderTaskDecomposition) {
  return decomposition.phases
    .map((phase, index) => `${index + 1}. ${phase.title}: ${phase.prompt.split("\n")[0]}`)
    .join("\n");
}
