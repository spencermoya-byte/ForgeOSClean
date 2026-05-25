import React from "react";
import { prepareBuilderExecution } from "./builderExecutionCoordinator";
import { applyGroupedVerifiedEdits } from "./builderGroupedApply";
import {
  describeOllamaStatus,
  getOllamaStatus,
  type OllamaModelInfo,
} from "./builderOllama";
import { getWorkspaceProjectPath } from "./workspaceSync";
import type { VerifiedEditState } from "./vivusExecutionLoop";

type Phase =
  | "idle"
  | "checking"
  | "planning"
  | "approval-ready"
  | "applying"
  | "complete"
  | "blocked";

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
  const [modelMessage, setModelMessage] = React.useState(
    "Checking local AI model status..."
  );
  const [prepared, setPrepared] = React.useState<VerifiedEditState[]>([]);
  const [applied, setApplied] = React.useState<VerifiedEditState[]>([]);
  const [primary, setPrimary] = React.useState<VerifiedEditState | null>(null);
  const [message, setMessage] = React.useState(
    "Describe a change and Vivus will plan the safest implementation scope."
  );

  const projectPath = getWorkspaceProjectPath();
  const busy =
    phase === "checking" ||
    phase === "planning" ||
    phase === "applying";
  const shownStates = applied.length ? applied : prepared;

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
    if (!trimmed || busy) return;

    setPrepared([]);
    setApplied([]);
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

  async function applyPrepared() {
    if (!prepared.length || busy) return;

    setPhase("applying");
    setMessage("Applying approved grouped edits with checkpoint and verification...");

    const result = await applyGroupedVerifiedEdits(
      prepared,
      `User request: ${task.trim()}`
    );

    setApplied(result.applied);
    setPrimary(result.failed ?? result.applied[0] ?? primary);
    setMessage(result.message);
    setPhase(result.ok ? "complete" : "blocked");
  }

  return (
    <section className="vivus-builder-v2">
      <div className="builder-shell">
        <div className="builder-top-grid">
          <div className="builder-status-card">
            <span>Workspace</span>
            <strong>{projectPath || "bedjet app"}</strong>
          </div>

          <div className="builder-status-card">
            <span>Planner</span>
            <strong>
              {models.length ? "qwen3.6:27b" : "No model available"}
            </strong>
          </div>

          <div className="builder-status-card">
            <span>Coder</span>
            <strong>
              {models.length ? "qwen3-coder:30b" : "No model available"}
            </strong>
          </div>
        </div>

        <section className="builder-main-card">
          <textarea
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="Describe the change Vivus should make to the current project..."
            className="builder-main-input"
          />

          <button
            type="button"
            onClick={() => void prepare()}
            disabled={!task.trim() || busy}
            className="builder-patch-button"
          >
            {busy ? "Working..." : "Prepare Patch"}
          </button>
        </section>

        <section className="builder-card">
          <div className="builder-card-header">Live execution timeline</div>
          <p>{message}</p>
        </section>

        <section className="builder-card">
          <div className="builder-card-header">Recent builder history</div>

          {shownStates.length > 0 ? (
            shownStates.map((state) => (
              <div
                key={state.proposal?.relativePath ?? state.message}
                className="builder-history-row"
              >
                <strong>{state.proposal?.relativePath ?? "No file"}</strong>
                <span>{state.stage}</span>
              </div>
            ))
          ) : (
            <p>No builder history yet.</p>
          )}
        </section>

        <section className="builder-card">
          <div className="builder-card-header">Session state</div>

          <p>{phase}</p>
          <p>{modelMessage}</p>
          <p>{statusLabel(primary)}</p>

          {phase === "approval-ready" && prepared.length > 0 && (
            <button type="button" onClick={() => void applyPrepared()}>
              Approve & Apply Group
            </button>
          )}
        </section>
      </div>
    </section>
  );
}