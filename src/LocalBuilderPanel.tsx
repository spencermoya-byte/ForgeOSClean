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

export function LocalBuilderPanel() {
  const [task, setTask] = React.useState("");
  const [phase, setPhase] = React.useState<BuilderPhase>("idle");
  const [logs, setLogs] = React.useState<BuilderLog[]>([
    makeLog("Builder ready", "Describe a project change and Vivus will run the local verified edit loop.", "done"),
  ]);
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
    pushLog("Checking local models", "Connecting to Ollama and selecting planner/coder models.", "active");

    const status = await getOllamaStatus();
    if (!status.ok || status.models.length === 0) {
      setModels([]);
      setPhase("blocked");
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
    pushLog("Models selected", `Planner: ${modelLabel(status.models, "planner")} • Coder: ${modelLabel(status.models, "coder")}`, "done");

    setPhase("planning");
    pushLog("Planning task", "Converting request into a verified edit plan with prior project context.", "active");

    const planSummary = `User requested: ${trimmed}\n\nProject path: ${projectPath}\n\nRecent builder history:\n${continuityContext}\n\nUse the smallest safe edit. Preserve existing behavior unless the request requires changing it. Verify after applying.`;

    setPhase("running");
    pushLog("Running verified edit loop", "Inferring file target, gathering context, generating patch, checkpointing, applying, verifying, and repairing if needed.", "active");

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
      pushLog("Builder complete", nextResult.message, "done");
    } else if (nextResult.stage === "rolled-back") {
      setPhase("blocked");
      pushLog("Rolled back", nextResult.message, "blocked");
    } else {
      setPhase("blocked");
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
        <span className={`local-builder-phase ${phase}`}>{phase}</span>
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
