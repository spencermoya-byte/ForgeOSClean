import { pickModel, type OllamaModelInfo } from "./builderOllama";

export type BuilderTaskType =
  | "ui"
  | "ux"
  | "frontend"
  | "backend"
  | "shell"
  | "code"
  | "visual"
  | "chat"
  | "language"
  | "planning"
  | "debugging"
  | "verification";

export type BuilderModelSelection = {
  taskType: BuilderTaskType;
  selectedModel: string;
  reason: string;
  confidence: number;
};

const TASK_TERMS: Record<BuilderTaskType, string[]> = {
  ui: ["ui", "layout", "button", "panel", "responsive", "dock", "screen"],
  ux: ["ux", "experience", "flow", "usability", "interaction"],
  frontend: ["frontend", "react", "tsx", "tailwind", "css", "component"],
  backend: ["backend", "rust", "tauri", "server", "filesystem", "database"],
  shell: ["terminal", "shell", "powershell", "cmd", "command"],
  code: ["code", "build", "implement", "feature", "refactor"],
  visual: ["image", "vision", "screenshot", "photo", "visual", "diagram"],
  chat: ["chat", "question", "explain", "help"],
  language: ["write", "grammar", "text", "language", "document"],
  planning: ["plan", "architecture", "roadmap", "design"],
  debugging: ["fix", "bug", "issue", "error", "broken", "not working"],
  verification: ["verify", "test", "validation", "confirm"],
};

function inferTaskType(request: string): BuilderTaskType {
  const text = request.toLowerCase();

  let winner: BuilderTaskType = "code";
  let score = 0;

  for (const [task, terms] of Object.entries(TASK_TERMS) as [BuilderTaskType, string[]][]) {
    const taskScore = terms.reduce((value, term) => value + (text.includes(term) ? 1 : 0), 0);
    if (taskScore > score) {
      winner = task;
      score = taskScore;
    }
  }

  return winner;
}

function bestModelForTask(task: BuilderTaskType, models: OllamaModelInfo[]) {
  const installed = models.map((model) => model.name);

  if (task === "visual") {
    return installed.find((model) => model.includes("vl") || model.includes("vision")) ?? installed[0] ?? "";
  }

  if (task === "planning") {
    return pickModel(models, "planner");
  }

  if (["backend", "frontend", "ui", "ux", "code", "debugging", "verification", "shell"].includes(task)) {
    return pickModel(models, "coder");
  }

  return installed[0] ?? "";
}

export function selectBestLocalModel(
  request: string,
  models: OllamaModelInfo[],
): BuilderModelSelection {
  const taskType = inferTaskType(request);
  const selectedModel = bestModelForTask(taskType, models);

  return {
    taskType,
    selectedModel,
    confidence: selectedModel ? 0.84 : 0.18,
    reason: selectedModel
      ? `Selected ${selectedModel} because the request was classified as ${taskType}.`
      : "No compatible installed local model was found.",
  };
}
