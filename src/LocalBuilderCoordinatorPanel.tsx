import React from "react";
import { prepareBuilderExecution } from "./builderExecutionCoordinator";
import { describeOllamaStatus, getOllamaStatus, type OllamaModelInfo } from "./builderOllama";
import { getWorkspaceProjectPath } from "./workspaceSync";
import type { VerifiedEditState } from "./vivusExecutionLoop";

type Phase = "idle" | "checking" | "planning" | "approval-ready" | "blocked";

function statusLabel(state: VerifiedEditState | null) {
  if (!state) return "No result";
  if (state.stage === "diff-ready") return "Diff ready";
  if (state.stage === "blocked") return "Blocked";
  return state.stage;
}

export function LocalBuilderCoordinatorPanel() {
  const [task, setTask] = React.useState("");
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [models, setModels] = React.useState<OllamaModelInfo[]>([]);
  const [modelMessage, setModelMessage] = React.useState("Checking local AI model status...");
  const [prepared, setPrepared] = React.useState<VerifiedEditState[]>([]);
  const [primary, setPrimary] = React.useState<VerifiedEditState | null>(null);
  const [message, setMessage] = React.useState("Describe a change and Vivus will plan the safest implementation scope.");

  const projectPath = getWorkspaceProjectPath();

  React.useEffect(() => {
    let cancelled = false;
    async function loadModels() {
      const status = await getOllamaStatus();
      if (cancelled) return;
      setModelMessage(describeOllamaStatus(status));
      setModels(status.ok ? status.models : []);
    }
    void loadModels();
    return () => {
      cancelled = true;
    };
  }, []);

  async function prepare() {
    const trimmed = task.trim();
    if (!trimmed || phase === "checking" || phase === "planning") return;

    setPrepared([]);
    setPrimary(null);
    setPhase("checking");
    setMessage("Checking local models...");

    const status = await getOllamaStatus();
    setModelMessage(describeOllamaStatus(status));
    setModels(status.ok ? status.models : []);

    if (!status.ok || status.models.length === 0) {
      setPhase("blocked");
      setMessage(describeOllamaStatus(status));
      return;
    }

    setPhase("planning");
    setMessage("Creating implementation plan and preparing verified diffs...");

    const result = await prepareBuilderExecution(projectPath, trimmed);
    setPrepared(result.prepared);
    setPrimary(result.primary);
    setMessage(result.message);
    setPhase(result.ok ? "approval-ready" : "blocked");
  }

  return (
    <section className="local-builder-panel">
      <div className="local-builder-header">
        <div>
          <h2>Local AI Builder</h2>
          <p>Coordinator-backed planning, grouped targeting, and verified diff preparation.</p>
        </div>
        <span className={`local-builder-phase ${phase}`}>{phase}</span>
      </div>

      <div className="local-builder-grid">
        <div className="local-builder-card"><strong>Workspace</strong><span>{projectPath}</span></div>
        <div className="local-builder-card"><strong>Models</strong><span>{models.length ? `${models.length} available` : "attention needed"}</span></div>
        <div className="local-builder-card"><strong>Result</strong><span>{statusLabel(primary)}</span></div>
      </div>

      <div className={`local-builder-result ${models.length ? "" : "blocked"}`}>
        <div className="local-builder-result-header"><strong>Local model status</strong><span>{models.length ? "ready" : "attention needed"}</span></div>
        <p>{modelMessage}</p>
      </div>

      <div className="local-builder-input-card">
        <textarea value={task} onChange={(event) => setTask(event.target.value)} placeholder="Describe the change Vivus should make to the current project..." />
        <button type="button" onClick={() => void prepare()} disabled={!task.trim() || phase === "checking" || phase === "planning"}>{phase === "checking" || phase === "planning" ? "Preparing..." : "Prepare Patch"}</button>
      </div>

      <div className="local-builder-result">
        <div className="local-builder-result-header"><strong>Builder coordinator</strong><span>{prepared.length} prepared</span></div>
        <p>{message}</p>
      </div>

      {prepared.map((state) => (
        <div key={state.proposal?.relativePath ?? state.message} className="local-builder-result">
          <div className="local-builder-result-header"><strong>{state.proposal?.relativePath ?? "No file"}</strong><span>{state.stage}</span></div>
          <p>{state.message}</p>
          {state.proposal?.diffPreview && <pre>{state.proposal.diffPreview}</pre>}
        </div>
      ))}
    </section>
  );
}
