import React from "react";
import { runVerifiedEditLoop, type VerifiedEditState } from "./vivusExecutionLoop";
import { getOllamaStatus, pickModel, type OllamaModelInfo } from "./builderOllama";
import { getWorkspaceProjectPath } from "./workspaceSync";
import {
  addBuilderHistory,
  buildBuilderHistoryContext,
  listBuilderHistory,
  updateBuilderHistory,
  type BuilderHistoryEntry,
} from "./builderHistory";
import { getBuilderSession, updateBuilderSession } from "./builderSessionState";

type BuilderPhase = "idle" | "checking-models" | "planning" | "running" | "complete" | "blocked";

type BuilderLog = {
  id: string;
  label: string;
  detail: string;
  status: "pending" | "active" | "done" | "blocked";
};

type TimelineStep = {
  id: string;
  label: string;
  detail: string;
  status: "pending" | "active" | "done" | "blocked";
};

const BASE_TIMELINE: TimelineStep[] = [
  { id: "models", label: "Check models", detail: "Connect to Ollama and select local planner/coder models.", status: "pending" },
  { id: "plan", label: "Plan request", detail: "Combine the user request with recent project memory.", status: "pending" },
  { id: "target", label: "Infer target", detail: "Find the safest project file to inspect and edit.", status: "pending" },
  { id: "context", label: "Load context", detail: "Read relevant repo files for project-aware generation.", status: "pending" },
  { id: "generate", label: "Generate patch", detail: "Use the local coder model to create a full-file patch.", status: "pending" },
  { id: "diff", label: "Build diff", detail: "Prepare a reviewable patch preview.", status: "pending" },
  { id: "checkpoint", label: "Checkpoint", detail: "Create rollback backup before writing.", status: "pending" },
  { id: "apply", label: "Apply", detail: "Write the approved patch to disk.", status: "pending" },
  { id: "verify", label: "Verify", detail: "Run build/verification checks.", status: "pending" },
  { id: "repair", label: "Repair or rollback", detail: "Repair build diagnostics or restore checkpoint if needed.", status: "pending" },
];

function makeLog(label: string, detail: string, status: BuilderLog["status"]): BuilderLog {
  return {
    id: `${Date.now()}-${Math.random()}`,
    label,
    detail,
    status,
  };
}

function modelLabel(models: OllamaModelInfo[], role: "planner" | "coder") {
  return pickModel(models, role) || "No model available";
}

function stageLabel(state: VerifiedEditState | null) {
  if (!state) return "No patch prepared";
  if (state.stage === "verified") return "Verified";
  if (state.stage === "repaired") return "Repaired + verified";
  if (state.stage === "rolled-back") return "Rolled back";
  if (state.stage === "blocked") return "Blocked";
  if (state.stage === "diff-ready") return "Diff ready";
  return state.stage;
}

function historyStatus(stage: VerifiedEditState["stage"]): BuilderHistoryEntry["status"] {
  if (stage === "verified" || stage === "repaired") return "complete";
  if (stage === "rolled-back") return "rolled-back";
  return "blocked";
}

function nextTimeline(current: TimelineStep[], stepId: string, status: TimelineStep["status"]) {
  const stepIndex = current.findIndex((step) => step.id === stepId);
  return current.map((step, index) => {
    if (step.id === stepId) return { ...step, status };
    if (status === "active" && index < stepIndex && step.status === "active") return { ...step, status: "done" };
    return step;
  });
}

export function LocalBuilderPanel() {
  const [task, setTask] = React.useState("");
  const [phase, setPhase] = React.useState<BuilderPhase>("idle");
  const [logs, setLogs] = React.useState<BuilderLog[]>([
    makeLog("Builder ready", "Describe a project change and Vivus will run the local verified edit loop.", "done"),
  ]);
  const [timeline, setTimeline] = React.useState<TimelineStep[]>(BASE_TIMELINE);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [models, setModels] = React.useState<OllamaModelInfo[]>([]);
  const [result, setResult] = React.useState<VerifiedEditState | null>(null);
  const [history, setHistory] = React.useState<BuilderHistoryEntry[]>([]);

  const projectPath = getWorkspaceProjectPath();
  const plannerModel = modelLabel(models, "planner");
  const coderModel = modelLabel(models, "coder");
  const running = phase === "checking-models" || phase === "planning" || phase === "running";

  const refreshHistory = React.useCallback(() => {
    setHistory(listBuilderHistory(projectPath));
  }, [projectPath]);

  const pushLog = React.useCallback((label: string, detail: string, status: BuilderLog["status"]) => {
    setLogs((current) => [makeLog(label, detail, status), ...current].slice(0, 20));
  }, []);

  const setStep = React.useCallback((stepId: string, status: TimelineStep["status"]) => {
    setTimeline((current) => nextTimeline(current, stepId, status));
  }, []);

  React.useEffect(() => {
    if (!startedAt || !running) return undefined;
    const id = window.setInterval(() => setElapsedMs(Date.now() - startedAt), 250);
    return () => window.clearInterval(id);
  }, [startedAt, running]);

  React.useEffect(() => {
    refreshHistory();
    const session = getBuilderSession(projectPath);
    if (session?.lastTask) {
      setTask(session.lastTask);
      setLogs((current) => [makeLog("Session restored", `Last task: ${session.lastTask}`, "done"), ...current].slice(0, 20));
    }
  }, [projectPath, refreshHistory]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      const status = await getOllamaStatus();
      if (cancelled) return;
      if (status.ok) {
        setModels(status.models);
      }
    }

    void loadModels();
    return () => {
      cancelled = true;
    };
  }, []);

  async function runBuilder() {
    const trimmed = task.trim();
    if (!trimmed || running) return;

    const start = Date.now();
    setStartedAt(start);
    setElapsedMs(0);
    setTimeline(BASE_TIMELINE);

    const continuityContext = buildBuilderHistoryContext(projectPath);
    const historyEntry = addBuilderHistory({
      projectPath,
      task: trimmed,
      status: "running",
      summary: "Builder started.",
      stage: "started",
    });

    updateBuilderSession({
      projectPath,
      lastTask: trimmed,
      lastStatus: "running",
      updatedAt: new Date().toISOString(),
    });

    refreshHistory();
    setResult(null);
    setPhase("checking-models");
    setStep("models", "active");
    pushLog("Checking local models", "Connecting to Ollama and selecting planner/coder models.", "active");

    const status = await getOllamaStatus();
    if (!status.ok || status.models.length === 0) {
      setModels([]);
      setPhase("blocked");
      setStep("models", "blocked");
      updateBuilderHistory(historyEntry.id, {
        status: "blocked",
        summary: status.blockedReason ?? "No local models found.",
        stage: "ollama-blocked",
      });
      updateBuilderSession({
        projectPath,
        lastTask: trimmed,
        lastStatus: "blocked",
        updatedAt: new Date().toISOString(),
      });
      refreshHistory();
      pushLog("Ollama unavailable", status.blockedReason ?? "No local models found.", "blocked");
      return;
    }

    setModels(status.models);
    setStep("models", "done");
    pushLog("Models selected", `Planner: ${modelLabel(status.models, "planner")} • Coder: ${modelLabel(status.models, "coder")}`, "done");

    setPhase("planning");
    setStep("plan", "active");
    pushLog("Planning task", "Converting request into a verified edit plan with prior project context.", "active");

    const planSummary = `User requested: ${trimmed}\n\nProject path: ${projectPath}\n\nRecent builder history:\n${continuityContext}\n\nUse the smallest safe edit. Preserve existing behavior unless the request requires changing it. Verify after applying.`;

    setPhase("running");
    setStep("plan", "done");
    setStep("target", "active");
    pushLog("Finding target file", "Ranking source files and selecting the safest edit target.", "active");
    window.setTimeout(() => setStep("context", "active"), 500);
    window.setTimeout(() => setStep("generate", "active"), 1100);
    window.setTimeout(() => setStep("diff", "active"), 1800);
    window.setTimeout(() => setStep("checkpoint", "active"), 2500);
    window.setTimeout(() => setStep("apply", "active"), 3200);
    window.setTimeout(() => setStep("verify", "active"), 3900);
    pushLog("Running verified edit loop", "Inferring target, gathering context, generating patch, checkpointing, applying, verifying, and repairing if needed.", "active");

    const nextResult = await runVerifiedEditLoop({
      projectPath,
      planSummary,
    });

    setResult(nextResult);

    const finalStatus = historyStatus(nextResult.stage);
    updateBuilderHistory(historyEntry.id, {
      status: finalStatus,
      summary: nextResult.message,
      changedFile: nextResult.proposal?.relativePath,
      stage: nextResult.stage,
    });
    updateBuilderSession({
      projectPath,
      lastTask: trimmed,
      lastStatus: finalStatus,
      lastChangedFile: nextResult.proposal?.relativePath,
      updatedAt: new Date().toISOString(),
    });
    refreshHistory();

    if (nextResult.stage === "verified" || nextResult.stage === "repaired") {
      setPhase("complete");
      setTimeline((current) => current.map((step) => ({ ...step, status: "done" })));
      setElapsedMs(Date.now() - start);
      pushLog("Builder complete", nextResult.message, "done");
    } else if (nextResult.stage === "rolled-back") {
      setPhase("blocked");
      setStep("repair", "done");
      setElapsedMs(Date.now() - start);
      pushLog("Rolled back", nextResult.message, "blocked");
    } else {
      setPhase("blocked");
      setStep("repair", "blocked");
      setElapsedMs(Date.now() - start);
      pushLog("Builder blocked", nextResult.message, "blocked");
    }
  }

  return (
    <section className="local-builder-panel">
      <div className="local-builder-header">
        <div>
          <h2>Local AI Builder</h2>
          <p>Planner + coder + verified patch loop for the active workspace.</p>
        </div>
        <span className={`local-builder-phase ${phase}`}>{phase} • {(elapsedMs / 1000).toFixed(1)}s</span>
      </div>

      <div className="local-builder-grid">
        <div className="local-builder-card">
          <strong>Workspace</strong>
          <span>{projectPath}</span>
        </div>
        <div className="local-builder-card">
          <strong>Planner</strong>
          <span>{plannerModel}</span>
        </div>
        <div className="local-builder-card">
          <strong>Coder</strong>
          <span>{coderModel}</span>
        </div>
      </div>

      <div className="local-builder-input-card">
        <textarea
          value={task}
          onChange={(event) => setTask(event.target.value)}
          placeholder="Describe the change Vivus should make to the current project..."
        />
        <button type="button" onClick={() => void runBuilder()} disabled={running || !task.trim()}>
          {running ? "Running..." : "Run Local Builder"}
        </button>
      </div>

      <div className="local-builder-result">
        <div className="local-builder-result-header">
          <strong>Live execution timeline</strong>
          <span>{running ? "active" : phase}</span>
        </div>
        <div className="local-builder-log">
          {timeline.map((step) => (
            <div key={step.id} className={`local-builder-log-row ${step.status}`}>
              <span />
              <div>
                <strong>{step.label}</strong>
                <em>{step.detail}</em>
              </div>
            </div>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="local-builder-result">
          <div className="local-builder-result-header">
            <strong>Recent builder history</strong>
            <span>{history.length} saved</span>
          </div>
          {history.slice(0, 5).map((entry) => (
            <p key={entry.id}>
              <strong>{entry.status}</strong> — {entry.task}{entry.changedFile ? ` • ${entry.changedFile}` : ""}
            </p>
          ))}
        </div>
      )}

      {result && (
        <div className="local-builder-result">
          <div className="local-builder-result-header">
            <strong>{stageLabel(result)}</strong>
            <span>{result.proposal?.relativePath ?? "No file changed"}</span>
          </div>
          <p>{result.message}</p>
          {result.proposal?.diffPreview && <pre>{result.proposal.diffPreview}</pre>}
        </div>
      )}

      <div className="local-builder-log">
        {logs.map((log) => (
          <div key={log.id} className={`local-builder-log-row ${log.status}`}>
            <span />
            <div>
              <strong>{log.label}</strong>
              <em>{log.detail}</em>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
