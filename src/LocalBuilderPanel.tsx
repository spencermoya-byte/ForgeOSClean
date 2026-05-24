import React from "react";
import {
  applyAndVerifyEdit,
  checkpointVerifiedEdit,
  prepareVerifiedEdit,
  runVerifiedEditLoop,
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

type BuilderPhase = "idle" | "checking-models" | "planning" | "running" | "approval-ready" | "complete" | "blocked";

type BuilderLog = {
  id: string;
  label: string;
  detail: string;
  status: "pending" | "active" | "done" | "blocked";
};

type TimelineStep = {
  id: string;
  eventType: BuilderExecutionEvent["type"] | "models" | "plan" | "approval";
  label: string;
  detail: string;
  status: "pending" | "active" | "done" | "blocked";
};

const BASE_TIMELINE: TimelineStep[] = [
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

function nextTimeline(current: TimelineStep[], event: BuilderExecutionEvent | { type: "models" | "plan" | "approval"; label: string; detail: string; status: TimelineStep["status"] }) {
  const stepIndex = current.findIndex((step) => step.eventType === event.type);
  if (stepIndex < 0) return current;
  return current.map((step, index) => {
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
  const [history, setHistory] = React.useState<BuilderHistoryEntry[]>([]);
  const [approvals, setApprovals] = React.useState<BuilderApprovalItem[]>([]);

  const projectPath = getWorkspaceProjectPath();
  const plannerModel = modelLabel(models, "planner");
  const coderModel = modelLabel(models, "coder");
  const running = phase === "checking-models" || phase === "planning" || phase === "running";

  const refreshHistory = React.useCallback(() => setHistory(listBuilderHistory(projectPath)), [projectPath]);
  const refreshApprovals = React.useCallback(() => setApprovals(listBuilderApprovals(projectPath)), [projectPath]);
  const pushLog = React.useCallback((label: string, detail: string, status: BuilderLog["status"]) => setLogs((current) => [makeLog(label, detail, status), ...current].slice(0, 24)), []);
  const applyTimelineEvent = React.useCallback((event: BuilderExecutionEvent | { type: "models" | "plan" | "approval"; label: string; detail: string; status: TimelineStep["status"] }) => {
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

    const start = Date.now();
    setStartedAt(start);
    setElapsedMs(0);
    setTimeline(BASE_TIMELINE);
    setPreparedState(null);
    setResult(null);
    setCurrentApprovalId(null);

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
      const approval = addBuilderApproval({
        projectPath,
        task: trimmed,
        relativePath: prepared.proposal.relativePath,
        diffPreview: prepared.proposal.diffPreview,
        status: "pending",
      });
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
    updateBuilderApproval(currentApprovalId, { status: nextResult.stage === "rolled-back" ? "rolled-back" : "applied" });
    updateBuilderHistory(currentHistoryId, { status: finalStatus, summary: nextResult.message, changedFile: nextResult.proposal?.relativePath, stage: nextResult.stage });
    updateBuilderSession({ projectPath, lastTask: task.trim(), lastStatus: finalStatus, lastChangedFile: nextResult.proposal?.relativePath, updatedAt: new Date().toISOString() });
    refreshApprovals();
    refreshHistory();
    if (nextResult.stage === "verified" || nextResult.stage === "repaired") setPhase("complete");
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
    <section className="local-builder-panel">
      <div className="local-builder-header">
        <div>
          <h2>Local AI Builder</h2>
          <p>Planner + coder + verified patch loop for the active workspace.</p>
        </div>
        <span className={`local-builder-phase ${phase}`}>{phase} • {(elapsedMs / 1000).toFixed(1)}s</span>
      </div>
      <div className="local-builder-grid">
        <div className="local-builder-card"><strong>Workspace</strong><span>{projectPath}</span></div>
        <div className="local-builder-card"><strong>Planner</strong><span>{plannerModel}</span></div>
        <div className="local-builder-card"><strong>Coder</strong><span>{coderModel}</span></div>
      </div>
      <div className="local-builder-input-card">
        <textarea value={task} onChange={(event) => setTask(event.target.value)} placeholder="Describe the change Vivus should make to the current project..." />
        <button type="button" onClick={() => void prepareBuilderPatch()} disabled={running || !task.trim()}>{running ? "Running..." : "Prepare Patch"}</button>
      </div>
      <div className="local-builder-result">
        <div className="local-builder-result-header"><strong>Live execution timeline</strong><span>{running ? "real-time" : phase}</span></div>
        <div className="local-builder-log">
          {timeline.map((step) => <div key={step.id} className={`local-builder-log-row ${step.status}`}><span /><div><strong>{step.label}</strong><em>{step.detail}</em></div></div>)}
        </div>
      </div>
      {preparedState?.proposal?.changed && phase === "approval-ready" && (
        <div className="local-builder-result">
          <div className="local-builder-result-header"><strong>Approval required</strong><span>{preparedState.proposal.relativePath}</span></div>
          <p>Review this diff before Vivus writes to disk.</p>
          <pre>{preparedState.proposal.diffPreview}</pre>
          <div className="file-editor-actions">
            <button type="button" onClick={() => void applyApprovedPatch()}>Approve & Apply</button>
            <button type="button" onClick={rejectPreparedPatch}>Reject</button>
          </div>
        </div>
      )}
      {approvals.length > 0 && (
        <div className="local-builder-result">
          <div className="local-builder-result-header"><strong>Approval queue</strong><span>{approvals.length} saved</span></div>
          {approvals.slice(0, 5).map((item) => <p key={item.id}><strong>{item.status}</strong> — {item.task} • {item.relativePath}</p>)}
        </div>
      )}
      {history.length > 0 && (
        <div className="local-builder-result"><div className="local-builder-result-header"><strong>Recent builder history</strong><span>{history.length} saved</span></div>{history.slice(0, 5).map((entry) => <p key={entry.id}><strong>{entry.status}</strong> — {entry.task}{entry.changedFile ? ` • ${entry.changedFile}` : ""}</p>)}</div>
      )}
      {result && phase !== "approval-ready" && (
        <div className="local-builder-result"><div className="local-builder-result-header"><strong>{stageLabel(result)}</strong><span>{result.proposal?.relativePath ?? "No file changed"}</span></div><p>{result.message}</p>{result.proposal?.diffPreview && <pre>{result.proposal.diffPreview}</pre>}</div>
      )}
      <div className="local-builder-log">{logs.map((log) => <div key={log.id} className={`local-builder-log-row ${log.status}`}><span /><div><strong>{log.label}</strong><em>{log.detail}</em></div></div>)}</div>
    </section>
  );
}
