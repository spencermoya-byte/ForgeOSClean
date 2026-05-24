import React from "react";
import "./BuilderDashboard.css";
import {
  applyAndVerifyEdit,
  checkpointVerifiedEdit,
  prepareVerifiedEdit,
  type VerifiedEditState,
} from "./vivusExecutionLoop";
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
import { subscribeToBuilderExecutionEvents, type BuilderExecutionEvent } from "./builderExecutionEvents";
import {
  addBuilderApproval,
  listBuilderApprovals,
  updateBuilderApproval,
  type BuilderApprovalItem,
} from "./builderApprovalQueue";
import { registerBuilderAttempt, resetBuilderAttempts } from "./builderLoopProtection";
import { createVerifiedFixSession, updateVerificationCriterion } from "./verifiedFixCriteria";

type BuilderPhase = "idle" | "checking-models" | "planning" | "running" | "approval-ready" | "complete" | "blocked";

type BuilderLog = {
  id: string;
  label: string;
  detail: string;
  status: "pending" | "active" | "done" | "blocked";
};

type TimelineStep = {
  id: string;
  eventType: BuilderExecutionEvent["type"] | "models" | "plan" | "approval" | "criteria";
  label: string;
  detail: string;
  status: "pending" | "active" | "done" | "blocked";
};

const BASE_TIMELINE: TimelineStep[] = [
  { id: "criteria", eventType: "criteria", label: "Acceptance criteria", detail: "Create required v1 verification checks.", status: "pending" },
  { id: "models", eventType: "models", label: "Check models", detail: "Connect to Ollama and select local planner/coder models.", status: "pending" },
  { id: "plan", eventType: "plan", label: "Plan request", detail: "Combine the user request with recent project memory.", status: "pending" },
  { id: "target", eventType: "infer-target", label: "Infer target", detail: "Find the safest project file to inspect and edit.", status: "pending" },
  { id: "context", eventType: "load-context", label: "Load context", detail: "Read relevant repo files for project-aware generation.", status: "pending" },
  { id: "generate", eventType: "generate-patch", label: "Generate patch", detail: "Use the local coder model to create a full-file patch.", status: "pending" },
  { id: "diff", eventType: "build-diff", label: "Build diff", detail: "Prepare a reviewable patch preview.", status: "pending" },
  { id: "approval", eventType: "approval", label: "Approval", detail: "Wait for explicit approval before writing to disk.", status: "pending" },
  { id: "checkpoint", eventType: "checkpoint", label: "Checkpoint", detail: "Create rollback backup before writing.", status: "pending" },
  { id: "apply", eventType: "apply", label: "Apply", detail: "Write the approved patch to disk.", status: "pending" },
  { id: "verify", eventType: "verify", label: "Verify", detail: "Run build/verification checks.", status: "pending" },
  { id: "repair", eventType: "repair", label: "Repair", detail: "Repair build diagnostics if available.", status: "pending" },
  { id: "rollback", eventType: "rollback", label: "Rollback", detail: "Restore checkpoint if verification cannot pass.", status: "pending" },
  { id: "verified", eventType: "verified", label: "Verified", detail: "Patch is verified or safely resolved.", status: "pending" },
];

function makeLog(label: string, detail: string, status: BuilderLog["status"]): BuilderLog {
  return { id: `${Date.now()}-${Math.random()}`, label, detail, status };
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

function nextTimeline(current: TimelineStep[], event: BuilderExecutionEvent | { type: "models" | "plan" | "approval" | "criteria"; label: string; detail: string; status: TimelineStep["status"] }): TimelineStep[] {
  const stepIndex = current.findIndex((step) => step.eventType === event.type);
  if (stepIndex < 0) return current;
  return current.map((step, index): TimelineStep => {
    if (index < stepIndex && step.status === "active") return { ...step, status: "done" };
    if (step.eventType === event.type) return { ...step, label: event.label, detail: event.detail, status: event.status };
    return step;
  });
}

export function LocalBuilderPanel() {
  const [task, setTask] = React.useState("");
  const [phase, setPhase] = React.useState<BuilderPhase>("idle");
  const [logs, setLogs] = React.useState<BuilderLog[]>([makeLog("Builder ready", "Describe a project change and Vivus will prepare a verified patch for approval.", "done")]);
  const [timeline, setTimeline] = React.useState<TimelineStep[]>(BASE_TIMELINE);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [models, setModels] = React.useState<OllamaModelInfo[]>([]);
  const [result, setResult] = React.useState<VerifiedEditState | null>(null);
  const [preparedState, setPreparedState] = React.useState<VerifiedEditState | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = React.useState<string | null>(null);
  const [currentApprovalId, setCurrentApprovalId] = React.useState<string | null>(null);
  const [currentCriteriaId, setCurrentCriteriaId] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<BuilderHistoryEntry[]>([]);
  const [approvals, setApprovals] = React.useState<BuilderApprovalItem[]>([]);

  const projectPath = getWorkspaceProjectPath();
  const plannerModel = modelLabel(models, "planner");
  const coderModel = modelLabel(models, "coder");
  const running = phase === "checking-models" || phase === "planning" || phase === "running";

  const refreshHistory = React.useCallback(() => setHistory(listBuilderHistory(projectPath)), [projectPath]);
  const refreshApprovals = React.useCallback(() => setApprovals(listBuilderApprovals(projectPath)), [projectPath]);
  const pushLog = React.useCallback((label: string, detail: string, status: BuilderLog["status"]) => setLogs((current) => [makeLog(label, detail, status), ...current].slice(0, 24)), []);
  const applyTimelineEvent = React.useCallback((event: BuilderExecutionEvent | { type: "models" | "plan" | "approval" | "criteria"; label: string; detail: string; status: TimelineStep["status"] }) => {
    setTimeline((current) => nextTimeline(current, event));
    pushLog(event.label, event.detail, event.status);
  }, [pushLog]);

  React.useEffect(() => subscribeToBuilderExecutionEvents((event) => {
    applyTimelineEvent(event);
    if (event.type === "blocked") setPhase("blocked");
    if (event.type === "verified") setPhase("complete");
  }), [applyTimelineEvent]);

  React.useEffect(() => {
    if (!startedAt || !running) return undefined;
    const id = window.setInterval(() => setElapsedMs(Date.now() - startedAt), 250);
    return () => window.clearInterval(id);
  }, [startedAt, running]);

  React.useEffect(() => {
    refreshHistory();
    refreshApprovals();
    const session = getBuilderSession(projectPath);
    if (session?.lastTask) {
      setTask(session.lastTask);
      setLogs((current) => [makeLog("Session restored", `Last task: ${session.lastTask}`, "done"), ...current].slice(0, 20));
    }
  }, [projectPath, refreshHistory, refreshApprovals]);

  React.useEffect(() => {
    let cancelled = false;
    async function loadModels() {
      const status = await getOllamaStatus();
      if (!cancelled && status.ok) setModels(status.models);
    }
    void loadModels();
    return () => { cancelled = true; };
  }, []);

  async function prepareBuilderPatch() {
    const trimmed = task.trim();
    if (!trimmed || running) return;

    const loopState = registerBuilderAttempt(projectPath, trimmed);
    if (loopState.blocked) {
      setPhase("blocked");
      applyTimelineEvent({ type: "criteria", label: "Loop guard stopped task", detail: "Repeated attempts detected. Adjust the request before retrying.", status: "blocked" });
      return;
    }

    const criteria = createVerifiedFixSession(projectPath, trimmed);
    setCurrentCriteriaId(criteria.id);

    const start = Date.now();
    setStartedAt(start);
    setElapsedMs(0);
    setTimeline(BASE_TIMELINE);
    setPreparedState(null);
    setResult(null);
    setCurrentApprovalId(null);
    applyTimelineEvent({ type: "criteria", label: "Acceptance criteria created", detail: "Target behavior, build pass, and no-regression checks are required.", status: "done" });

    const continuityContext = buildBuilderHistoryContext(projectPath);
    const historyEntry = addBuilderHistory({ projectPath, task: trimmed, status: "running", summary: "Builder patch preparation started.", stage: "preparing" });
    setCurrentHistoryId(historyEntry.id);
    updateBuilderSession({ projectPath, lastTask: trimmed, lastStatus: "running", updatedAt: new Date().toISOString() });
    refreshHistory();

    setPhase("checking-models");
    applyTimelineEvent({ type: "models", label: "Checking local models", detail: "Connecting to Ollama and selecting planner/coder models.", status: "active" });
    const status = await getOllamaStatus();
    if (!status.ok || status.models.length === 0) {
      setModels([]);
      setPhase("blocked");
      applyTimelineEvent({ type: "models", label: "Ollama unavailable", detail: status.blockedReason ?? "No local models found.", status: "blocked" });
      updateBuilderHistory(historyEntry.id, { status: "blocked", summary: status.blockedReason ?? "No local models found.", stage: "ollama-blocked" });
      refreshHistory();
      return;
    }

    setModels(status.models);
    applyTimelineEvent({ type: "models", label: "Models selected", detail: `Planner: ${modelLabel(status.models, "planner")} • Coder: ${modelLabel(status.models, "coder")}`, status: "done" });
    setPhase("planning");
    applyTimelineEvent({ type: "plan", label: "Planning task", detail: "Preparing a patch proposal with prior project context.", status: "active" });

    const planSummary = `User requested: ${trimmed}\n\nProject path: ${projectPath}\n\nRecent builder history:\n${continuityContext}\n\nPrepare a patch for approval before writing. Use the smallest safe edit. Preserve existing behavior unless the request requires changing it.`;
    applyTimelineEvent({ type: "plan", label: "Plan ready", detail: "Generating a diff proposal for approval.", status: "done" });
    setPhase("running");

    const prepared = await prepareVerifiedEdit({ projectPath, planSummary });
    setPreparedState(prepared);
    setResult(prepared);
    setElapsedMs(Date.now() - start);

    if (prepared.stage === "diff-ready" && prepared.proposal?.changed) {
      const approval = addBuilderApproval({ projectPath, task: trimmed, relativePath: prepared.proposal.relativePath, diffPreview: prepared.proposal.diffPreview, status: "pending" });
      setCurrentApprovalId(approval.id);
      setPhase("approval-ready");
      applyTimelineEvent({ type: "approval", label: "Approval required", detail: `Review ${prepared.proposal.relativePath} before applying.`, status: "active" });
      updateBuilderHistory(historyEntry.id, { status: "blocked", summary: "Patch proposal is waiting for user approval.", changedFile: prepared.proposal.relativePath, stage: "approval-ready" });
      updateBuilderSession({ projectPath, lastTask: trimmed, lastStatus: "approval-ready", lastChangedFile: prepared.proposal.relativePath, updatedAt: new Date().toISOString() });
      refreshApprovals();
      refreshHistory();
      return;
    }

    setPhase("blocked");
    applyTimelineEvent({ type: "approval", label: "No approval available", detail: prepared.message, status: "blocked" });
    updateBuilderHistory(historyEntry.id, { status: "blocked", summary: prepared.message, changedFile: prepared.proposal?.relativePath, stage: prepared.stage });
    refreshHistory();
  }

  async function applyApprovedPatch() {
    if (!preparedState || !preparedState.proposal || !currentApprovalId || !currentHistoryId) return;
    applyTimelineEvent({ type: "approval", label: "Approval accepted", detail: "Creating checkpoint and applying patch.", status: "done" });
    setPhase("running");
    updateBuilderApproval(currentApprovalId, { status: "approved" });
    refreshApprovals();
    const checkpointed = await checkpointVerifiedEdit(preparedState);
    if (checkpointed.stage !== "checkpoint-ready") {
      setResult(checkpointed);
      setPhase("blocked");
      updateBuilderHistory(currentHistoryId, { status: "blocked", summary: checkpointed.message, stage: checkpointed.stage });
      return;
    }
    const nextResult = await applyAndVerifyEdit(checkpointed, preparedState.message);
    setResult(nextResult);
    const finalStatus = historyStatus(nextResult.stage);
    const passed = nextResult.stage === "verified" || nextResult.stage === "repaired";
    if (currentCriteriaId) {
      updateVerificationCriterion(currentCriteriaId, "build-pass", passed);
      updateVerificationCriterion(currentCriteriaId, "target-goal", passed);
      updateVerificationCriterion(currentCriteriaId, "no-regression", passed);
    }
    if (passed) resetBuilderAttempts(projectPath, task.trim());
    updateBuilderApproval(currentApprovalId, { status: nextResult.stage === "rolled-back" ? "rolled-back" : "applied" });
    updateBuilderHistory(currentHistoryId, { status: finalStatus, summary: nextResult.message, changedFile: nextResult.proposal?.relativePath, stage: nextResult.stage });
    updateBuilderSession({ projectPath, lastTask: task.trim(), lastStatus: finalStatus, lastChangedFile: nextResult.proposal?.relativePath, updatedAt: new Date().toISOString() });
    refreshApprovals();
    refreshHistory();
    if (passed) setPhase("complete");
    else setPhase("blocked");
  }

  function rejectPreparedPatch() {
    if (currentApprovalId) updateBuilderApproval(currentApprovalId, { status: "rejected" });
    if (currentHistoryId) updateBuilderHistory(currentHistoryId, { status: "blocked", summary: "Patch rejected by user.", stage: "rejected" });
    setPreparedState(null);
    setPhase("idle");
    applyTimelineEvent({ type: "approval", label: "Patch rejected", detail: "No files were changed.", status: "blocked" });
    refreshApprovals();
    refreshHistory();
  }

  return (
    <section className="builder-dash">
      <div className="builder-dash-main">
        <section className="builder-dash-card builder-hero">
          <div className="builder-hero-mark">V</div>
          <div>
            <h2>Vivus · Local Agent Orchestrator</h2>
            <p>Plan → Build → Verify → Patch<br />You are in control. Vivus executes locally.</p>
          </div>
          <div className="builder-status-box">
            <strong>● READY</strong>
            <span>All Systems Operational</span>
          </div>
          <button type="button" className="builder-hero-button">View System Health ›</button>
        </section>

        <section className="builder-dash-card builder-input-card">
          <textarea value={task} onChange={(event) => setTask(event.target.value)} placeholder="Describe the change Vivus should make to the current project..." />
          <div className="builder-actions">
            <button type="button" className="builder-action-button primary" onClick={() => void prepareBuilderPatch()} disabled={running || !task.trim()}>{running ? "Running..." : "Prepare Patch"}</button>
            <span className="spacer" />
            <button type="button" className="builder-action-button">Attach Context</button>
            <button type="button" className="builder-action-button">Add Criteria</button>
            <button type="button" className="builder-action-button primary">Builder: Local</button>
          </div>
        </section>

        <section className="builder-dash-card builder-timeline">
          <div className="builder-timeline-title"><strong>Live execution timeline</strong><span>{running ? "real-time" : phase}</span></div>
          <div className="builder-timeline-list">
            {timeline.map((step) => <div key={step.id} className={`builder-step ${step.status}`}><span className="builder-step-dot" /><div><strong>{step.label}</strong><em>{step.detail}</em></div></div>)}
          </div>
          <div className="builder-dock-space" />
        </section>

        {preparedState?.proposal?.changed && phase === "approval-ready" && <section className="builder-dash-card builder-timeline"><div className="builder-timeline-title"><strong>Approval required</strong><span>{preparedState.proposal.relativePath}</span></div><p>Review this diff before Vivus writes to disk.</p><pre>{preparedState.proposal.diffPreview}</pre><div className="file-editor-actions"><button type="button" onClick={() => void applyApprovedPatch()}>Approve & Apply</button><button type="button" onClick={rejectPreparedPatch}>Reject</button></div></section>}
        {result && phase !== "approval-ready" && <section className="builder-dash-card builder-timeline"><div className="builder-timeline-title"><strong>{stageLabel(result)}</strong><span>{result.proposal?.relativePath ?? "No file changed"}</span></div><p>{result.message}</p>{result.proposal?.diffPreview && <pre>{result.proposal.diffPreview}</pre>}</section>}
        {logs.length > 0 && <section className="builder-dash-card builder-side"><div className="builder-timeline-title"><strong>Builder activity</strong><span>{logs.length}</span></div>{logs.slice(0, 3).map((log) => <p key={log.id}><strong>{log.label}</strong> {log.detail}</p>)}</section>}
      </div>

      <aside className="builder-dash-rail">
        <section className="builder-dash-card builder-side">
          <div className="builder-count">0<br />Pending</div>
          <h3>Plugin Approvals</h3>
          <p>Review permission requests before risky plugin actions run.</p>
          <p>No pending permission requests.</p>
        </section>
        <section className="builder-dash-card builder-side">
          <h3>Plugin Manager</h3>
          <p>Runtime status and permissions for active plugins.</p>
          <div className="builder-plugin-row"><div><strong>Live Preview</strong><span>Runs and displays local project previews inside Vivus.</span></div><em className="builder-ok">● READY</em></div>
          <div className="builder-plugin-row"><div><strong>Terminal</strong><span>Provides allowlisted local command execution and terminal workflows.</span></div><em className="builder-wait">● NEEDS APPROVAL</em></div>
          <div className="builder-plugin-row"><div><strong>Commits</strong><span>Tracks checkpoints, commits, rollback, and project history.</span></div><em className="builder-wait">● NEEDS APPROVAL</em></div>
        </section>
        <section className="builder-dash-card builder-side">
          <h3>Plugin Audit</h3>
          <p>Recent plugin events and security decisions.</p>
          <p>No recent events.</p>
        </section>
      </aside>
    </section>
  );
}
