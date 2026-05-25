import type { VerifiedEditState } from "./vivusExecutionLoop";

type VerifiedEditPanelProps = {
  state: VerifiedEditState | null;
  isRunning: boolean;
  onPrepare: () => void;
  onRun: () => void;
};

function stageLabel(stage: VerifiedEditState["stage"]) {
  switch (stage) {
    case "diff-ready":
      return "Diff ready";
    case "checkpoint-ready":
      return "Checkpoint ready";
    case "verified":
      return "Verified fixed";
    case "rolled-back":
      return "Rolled back";
    case "blocked":
      return "Blocked";
    case "inspecting":
      return "Inspecting";
    case "applying":
      return "Applying";
    case "verifying":
      return "Verifying";
    default:
      return "Ready";
  }
}

function verificationStatus(state: VerifiedEditState) {
  if (state.stage === "verified" || state.stage === "repaired") return "Verified Fixed";
  if (state.stage === "rolled-back") return "Not Fixed — Rolled Back";
  if (state.stage === "blocked") return "Blocked";
  if (state.verification) return "Verification Failed";
  return "Pending";
}

export function VerifiedEditPanel({ state, isRunning, onPrepare, onRun }: VerifiedEditPanelProps) {
  if (!state) {
    return (
      <section className="verified-edit-panel">
        <div className="verified-edit-header">
          <div>
            <strong>Verified edit loop</strong>
            <span>Inspect → diff → checkpoint → patch → verify → rollback if needed</span>
          </div>
          <button type="button" onClick={onPrepare} disabled={isRunning}>
            {isRunning ? "Preparing..." : "Prepare edit"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`verified-edit-panel stage-${state.stage}`}>
      <div className="verified-edit-header">
        <div>
          <strong>Verified edit loop</strong>
          <span>{stageLabel(state.stage)}</span>
        </div>
        <div className="verified-edit-actions">
          <button type="button" onClick={onPrepare} disabled={isRunning}>
            Refresh diff
          </button>
          <button type="button" className="primary" onClick={onRun} disabled={isRunning || state.stage !== "diff-ready" || !state.proposal?.changed}>
            {isRunning ? "Running..." : "Checkpoint + apply + verify"}
          </button>
        </div>
      </div>

      <p className="verified-edit-message">{state.message}</p>

      <div className="verified-edit-result-row">
        <strong>Proof status</strong>
        <span>{verificationStatus(state)}</span>
      </div>

      <div className="verified-edit-steps">
        {state.steps.map((step) => (
          <div key={step.id} className={`verified-edit-step ${step.status}`}>
            <span className="verified-edit-dot" />
            <div>
              <strong>{step.label}</strong>
              <em>{step.detail}</em>
            </div>
          </div>
        ))}
      </div>

      {state.proposal && (
        <div className="verified-edit-diff-card">
          <div className="verified-edit-diff-header">
            <strong>{state.proposal.relativePath}</strong>
            <span>{state.proposal.changed ? "Changes detected" : "No change"}</span>
          </div>
          <pre>{state.proposal.diffPreview}</pre>
        </div>
      )}

      {state.checkpoint?.checkpointId && (
        <div className="verified-edit-result-row">
          <strong>Checkpoint</strong>
          <span>{state.checkpoint.checkpointId}</span>
        </div>
      )}

      {state.patchResult && (
        <div className="verified-edit-result-row">
          <strong>Patch</strong>
          <span>{state.patchResult.ok ? "Applied" : state.patchResult.blockedReason ?? "Blocked"}</span>
        </div>
      )}

      {state.verification && (
        <div className="verified-edit-result-row">
          <strong>Verification</strong>
          <span>{state.verification.message}</span>
        </div>
      )}

      {state.rollback && (
        <div className="verified-edit-result-row">
          <strong>Rollback</strong>
          <span>{state.rollback.ok ? "Checkpoint restored" : state.rollback.blockedReason ?? "Rollback blocked"}</span>
        </div>
      )}
    </section>
  );
}
