import React from "react";
import "./App.css";
import "./BuilderLifecycle.css";
import "./BuilderWorkflow.css";
import "./VerifiedEditPanel.css";
import { CommitPanel } from "./CommitPanel";
import { ProjectFilesPanel, initializeProjectFiles } from "./ProjectFilesPanel";
import { runBuilderExecutionPreview } from "./builderExecution";
import { VerifiedEditPanel } from "./VerifiedEditPanel";
import {
  applyAndVerifyEdit,
  checkpointVerifiedEdit,
  prepareVerifiedEdit,
  type VerifiedEditState,
} from "./vivusExecutionLoop";
import {
  ChevronDown,
  Code2,
  LayoutGrid,
  Monitor,
  Plus,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

type Route = "create" | "apps" | "account" | "workspace";
type WorkspaceTab = "preview" | "builder" | "files" | "commits" | "plugins" | "console" | "publish";
type OpenPlugin = WorkspaceTab;
type BuildMode = "build" | "plan";
type BuildMessage = { role: "user" | "assistant"; content: string };
type ProjectRecord = { id: string; name: string; originalPrompt: string; createdAt: string; updatedAt: string; status: "active" | "draft" };
type BuilderPlan = { summary: string; requirements: string[]; acceptance: string[] };
type TaskStatus = "queued" | "running" | "done" | "failed";
type BuilderTask = { id: string; title: string; status: TaskStatus };
type ActivityStatus = "pending" | "active" | "done" | "blocked";
type BuilderActivity = { id: string; label: string; detail: string; status: ActivityStatus };

const PROJECT_KEY = "vivus.projects.v1";
const ACTIVE_PROJECT_KEY = "vivus.activeProject.v1";
const quickStarts = ["Website", "Desktop App", "AI Tool", "Automation", "API", "Game", "Utility"];
const bottomNav: Array<{ route: Route; label: string; icon: React.ReactNode }> = [
  { route: "apps", label: "Apps", icon: <LayoutGrid size={20} strokeWidth={2.2} /> },
  { route: "create", label: "Create", icon: <Sparkles size={20} strokeWidth={2.2} /> },
  { route: "account", label: "Account", icon: <UserRound size={20} strokeWidth={2.2} /> },
];
const defaultPlugins: OpenPlugin[] = ["preview", "builder", "commits"];
const availablePlugins: Array<{ id: OpenPlugin; label: string }> = [
  { id: "preview", label: "Live Preview" },
  { id: "builder", label: "Builder" },
  { id: "files", label: "Files" },
  { id: "commits", label: "Commits" },
  { id: "plugins", label: "Plugins" },
  { id: "console", label: "Console" },
  { id: "publish", label: "Publish" },
];

function normalizeRoute(value: string): Route {
  const cleaned = value.replace("#", "").replace("/", "").trim().toLowerCase();
  if (cleaned === "apps") return "apps";
  if (cleaned === "account") return "account";
  if (cleaned === "workspace") return "workspace";
  return "create";
}

function pluginLabel(id: OpenPlugin) {
  return availablePlugins.find((plugin) => plugin.id === id)?.label ?? id;
}

function readProjects(): ProjectRecord[] {
  try {
    const raw = localStorage.getItem(PROJECT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function projectNameFrom(prompt: string) {
  const words = prompt.trim().replace(/^(build|create|make|design)\s+/i, "").split(/\s+/).slice(0, 5).join(" ");
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Untitled Project";
}

function shortDate(value: string) {
  return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function makePlan(input: string): BuilderPlan {
  const cleaned = input.trim();
  return {
    summary: `Build request captured: ${cleaned}. Vivus will turn this into a scoped implementation plan before editing project files.`,
    requirements: [
      "Preserve the existing working UI and project structure.",
      "Identify the files/components that must change before editing.",
      "Use minimal safe patches instead of broad rewrites.",
      "Keep the result local-first with no hidden telemetry or cloud dependency.",
    ],
    acceptance: [
      "The requested behavior is visible in the app.",
      "No unrelated routes or panels regress.",
      "The project builds successfully after changes.",
      "The user can revise the plan before execution.",
    ],
  };
}

function makeTasks(mode: "planned" | "approved" | "complete"): BuilderTask[] {
  return [
    { id: "task-1", title: "Analyze the request and convert it into acceptance criteria", status: mode === "planned" ? "queued" : "done" },
    { id: "task-2", title: "Find the relevant project files and verify current source state", status: mode === "planned" ? "queued" : mode === "approved" ? "running" : "done" },
    { id: "task-3", title: "Apply a minimal implementation patch", status: mode === "complete" ? "done" : "queued" },
    { id: "task-4", title: "Run build/type verification", status: mode === "complete" ? "done" : "queued" },
    { id: "task-5", title: "Report verified result or stop with failure details", status: mode === "complete" ? "done" : "queued" },
  ];
}

function makeActivity(mode: "planned" | "approved" | "complete"): BuilderActivity[] {
  if (mode === "planned") {
    return [
      { id: "activity-1", label: "Plan generated", detail: "Waiting for approval before file work begins.", status: "done" },
      { id: "activity-2", label: "Source verification", detail: "Queued until the plan is approved.", status: "pending" },
      { id: "activity-3", label: "Patch execution", detail: "Blocked until approval and backend execution are connected.", status: "pending" },
    ];
  }

  if (mode === "approved") {
    return [
      { id: "activity-1", label: "Plan approved", detail: "Build queue is ready for execution.", status: "done" },
      { id: "activity-2", label: "Source verification", detail: "Next step: inspect project files before editing.", status: "active" },
      { id: "activity-3", label: "Patch execution", detail: "Waiting for local backend/file editing integration.", status: "pending" },
      { id: "activity-4", label: "Verification", detail: "Will run after implementation patches are applied.", status: "pending" },
    ];
  }

  return [
    { id: "activity-1", label: "Plan approved", detail: "Build queue accepted by the user.", status: "done" },
    { id: "activity-2", label: "Source verification", detail: "Simulated file targeting pass completed.", status: "done" },
    { id: "activity-3", label: "Patch execution", detail: "Execution preview complete; real file writes require backend connection.", status: "blocked" },
    { id: "activity-4", label: "Verification", detail: "Build verification is queued for the future local runner.", status: "pending" },
  ];
}

export default function App() {
  const [route, setRoute] = React.useState<Route>(() => normalizeRoute(window.location.hash || "create"));
  const [workspaceTab, setWorkspaceTab] = React.useState<WorkspaceTab>("builder");
  const [openPlugins, setOpenPlugins] = React.useState<OpenPlugin[]>(defaultPlugins);
  const [showPluginLauncher, setShowPluginLauncher] = React.useState(false);
  const [showProjectMenu, setShowProjectMenu] = React.useState(false);
  const [toast, setToast] = React.useState("");
  const [homePrompt, setHomePrompt] = React.useState("");
  const [projects, setProjects] = React.useState<ProjectRecord[]>(readProjects);
  const [activeProjectId, setActiveProjectId] = React.useState(() => localStorage.getItem(ACTIVE_PROJECT_KEY) ?? "");
  const [buildInput, setBuildInput] = React.useState("");
  const [buildMessages, setBuildMessages] = React.useState<BuildMessage[]>([]);
  const [currentMode, setCurrentMode] = React.useState<BuildMode>("build");
  const [planApproved, setPlanApproved] = React.useState(false);
  const [builderPlan, setBuilderPlan] = React.useState<BuilderPlan | null>(null);
  const [builderTasks, setBuilderTasks] = React.useState<BuilderTask[]>([]);
  const [builderActivity, setBuilderActivity] = React.useState<BuilderActivity[]>([]);
  const [executionPreviewed, setExecutionPreviewed] = React.useState(false);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [verifiedEdit, setVerifiedEdit] = React.useState<VerifiedEditState | null>(null);
  const [isVerifiedEditRunning, setIsVerifiedEditRunning] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;
  const hasStartedConversation = buildMessages.length > 0;

  React.useEffect(() => {
    const handleHash = () => setRoute(normalizeRoute(window.location.hash || "create"));
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  React.useEffect(() => {
    localStorage.setItem(PROJECT_KEY, JSON.stringify(projects));
  }, [projects]);

  React.useEffect(() => {
    if (activeProjectId) localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
  }, [activeProjectId]);

  React.useEffect(() => {
    if (!toast) return undefined;
    const id = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [buildMessages, builderPlan, builderTasks, builderActivity, verifiedEdit]);

  function navigate(nextRoute: Route) {
    setRoute(nextRoute);
    window.location.hash = `/${nextRoute}`;
  }

  function action(label: string) {
    setToast(label);
  }

  function greetingMessage(project: ProjectRecord | null) {
    return project ? `${project.name} is loaded. What should we build first?` : "What would you like to build today?";
  }

  function resetBuilderWorkflow() {
    setBuildInput("");
    setPlanApproved(false);
    setBuilderPlan(null);
    setBuilderTasks([]);
    setBuilderActivity([]);
    setExecutionPreviewed(false);
    setIsExecuting(false);
    setVerifiedEdit(null);
    setIsVerifiedEditRunning(false);
  }

  function seedWorkspace(project: ProjectRecord, startWithPrompt = false) {
    initializeProjectFiles();
    setActiveProjectId(project.id);
    setWorkspaceTab("builder");
    setShowProjectMenu(false);
    resetBuilderWorkflow();
    setBuildMessages(
      startWithPrompt
        ? [
            { role: "user", content: project.originalPrompt },
            { role: "assistant", content: `Project saved locally.\n\nProject: ${project.name}\n\nStarter files are ready in the Files tab. I’ll use this as the starting build specification.` },
          ]
        : []
    );
  }

  function createProject(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setToast("Describe the project first");
      return;
    }

    const now = new Date().toISOString();
    const project: ProjectRecord = {
      id: `project-${Date.now()}`,
      name: projectNameFrom(trimmed),
      originalPrompt: trimmed,
      createdAt: now,
      updatedAt: now,
      status: "active",
    };

    initializeProjectFiles();
    setProjects((current) => [project, ...current]);
    setHomePrompt("");
    seedWorkspace(project, true);
    navigate("workspace");
    setToast("Project created");
  }

  function openProject(project: ProjectRecord) {
    initializeProjectFiles();
    const updated = { ...project, updatedAt: new Date().toISOString(), status: "active" as const };
    setProjects((current) => current.map((item) => (item.id === project.id ? updated : item)));
    seedWorkspace(updated, false);
    navigate("workspace");
  }

  function switchWorkspaceTab(tab: WorkspaceTab) {
    setWorkspaceTab(tab);
    setShowPluginLauncher(false);
  }

  function openPlugin(pluginId: OpenPlugin) {
    setOpenPlugins((current) => (current.includes(pluginId) ? current : [...current, pluginId]));
    setWorkspaceTab(pluginId);
    setShowPluginLauncher(false);
  }

  function closePlugin(pluginId: OpenPlugin) {
    if (defaultPlugins.includes(pluginId)) return;
    setOpenPlugins((current) => {
      const next = current.filter((id) => id !== pluginId);
      if (workspaceTab === pluginId) setWorkspaceTab("builder");
      return next.length ? next : defaultPlugins;
    });
  }

  function handleApprovePlan() {
    setPlanApproved(true);
    setCurrentMode("build");
    setExecutionPreviewed(false);
    setVerifiedEdit(null);
    setBuilderTasks(makeTasks("approved"));
    setBuilderActivity(makeActivity("approved"));
    setBuildMessages((current) => [...current, { role: "assistant", content: "Plan approved. The execution queue is staged and source verification is next." }]);
  }

  function handleRevisePlan() {
    setCurrentMode("plan");
    setPlanApproved(false);
    setExecutionPreviewed(false);
    setVerifiedEdit(null);
    setBuilderTasks(makeTasks("planned"));
    setBuilderActivity(makeActivity("planned"));
    setBuildMessages((current) => [...current, { role: "assistant", content: "Plan revision mode is active. Send the changes you want and I’ll regenerate the build plan." }]);
  }

  async function handleExecutionPreview() {
    if (!planApproved || !builderPlan || isExecuting) return;
    setIsExecuting(true);
    setBuilderTasks(makeTasks("approved"));
    setBuilderActivity([
      { id: "activity-1", label: "Execution bridge", detail: "Calling local execution bridge...", status: "active" },
      { id: "activity-2", label: "Source verification", detail: "Waiting for backend response.", status: "pending" },
    ]);

    const result = await runBuilderExecutionPreview(builderPlan.summary);

    setExecutionPreviewed(true);
    setIsExecuting(false);
    setBuilderTasks(result.tasks as BuilderTask[]);
    setBuilderActivity(result.activity as BuilderActivity[]);
    setBuildMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: result.message,
      },
    ]);
  }

  async function handlePrepareVerifiedEdit() {
    if (!planApproved || !builderPlan || isVerifiedEditRunning) return;
    setIsVerifiedEditRunning(true);
    setBuildMessages((current) => [...current, { role: "assistant", content: "Preparing verified edit: inspecting source and generating diff preview." }]);
    const nextState = await prepareVerifiedEdit({ planSummary: builderPlan.summary });
    setVerifiedEdit(nextState);
    setIsVerifiedEditRunning(false);
  }

  async function handleRunVerifiedEdit() {
    if (!builderPlan || !verifiedEdit || isVerifiedEditRunning) return;
    setIsVerifiedEditRunning(true);
    const checkpointed = await checkpointVerifiedEdit(verifiedEdit);
    setVerifiedEdit(checkpointed);

    if (checkpointed.stage !== "checkpoint-ready") {
      setBuildMessages((current) => [...current, { role: "assistant", content: checkpointed.message }]);
      setIsVerifiedEditRunning(false);
      return;
    }

    const result = await applyAndVerifyEdit(checkpointed, builderPlan.summary);
    setVerifiedEdit(result);
    setIsVerifiedEditRunning(false);
    setBuildMessages((current) => [...current, { role: "assistant", content: result.message }]);
  }

  function handleBuildSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = buildInput.trim();
    if (!trimmed) {
      setToast("Enter a build request first");
      return;
    }

    if (currentMode === "plan" || !builderPlan) {
      const nextPlan = makePlan(trimmed);
      setBuilderPlan(nextPlan);
      setBuilderTasks(makeTasks("planned"));
      setBuilderActivity(makeActivity("planned"));
      setPlanApproved(false);
      setExecutionPreviewed(false);
      setVerifiedEdit(null);
      setBuildMessages((current) => [
        ...current,
        { role: "user", content: trimmed },
        { role: "assistant", content: "I generated a build plan. Review it below, then approve or revise before execution." },
      ]);
    } else {
      setBuildMessages((current) => [
        ...current,
        { role: "user", content: trimmed },
        { role: "assistant", content: "I added this to the active build context. Approve the plan when you’re ready to execute." },
      ]);
    }

    setBuildInput("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function renderModeSelector() {
    return (
      <button type="button" className="mode-selector" onClick={() => setCurrentMode((mode) => (mode === "build" ? "plan" : "build"))} aria-label="Toggle build mode">
        <span>{currentMode === "build" ? "Build" : "Plan"}</span>
        <ChevronDown size={13} strokeWidth={2.5} />
      </button>
    );
  }

  function renderBuildComposer(extraClass = "") {
    return (
      <form onSubmit={handleBuildSubmit} className={`ai-builder-input-form ${extraClass}`.trim()}>
        <textarea placeholder={currentMode === "plan" ? "Describe your requirements and goals..." : "Make, test, iterate..."} value={buildInput} onChange={(event) => setBuildInput(event.target.value)} onKeyDown={handleKeyDown} />
        <button type="button" className="ai-builder-plus" aria-label="Add context" onClick={() => action("Add context")}>
          <Plus size={19} strokeWidth={2.6} />
        </button>
        <div className="composer-controls" aria-label="Composer controls">
          {renderModeSelector()}
          <button type="submit" className="send-button" aria-label="Send build request">
            <Send size={17} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    );
  }

  function renderWorkflowPanel() {
    if (!builderPlan) return null;
    return (
      <>
        <section className="builder-workflow-panel">
          <div className="builder-workflow-header">
            <div><strong>{planApproved ? "Approved build queue" : "Plan review"}</strong><br /><span>{planApproved ? "Execution transparency is active" : "Approve before implementation"}</span></div>
            <span>{builderTasks.filter((task) => task.status === "done").length}/{builderTasks.length} done</span>
          </div>
          <div className="builder-plan-body">
            <p className="builder-plan-summary">{builderPlan.summary}</p>
            <div className="builder-plan-grid">
              <div className="builder-plan-section"><strong>Requirements</strong><ul>{builderPlan.requirements.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div className="builder-plan-section"><strong>Acceptance criteria</strong><ul>{builderPlan.acceptance.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </div>
            <div className="builder-plan-section"><strong>Task queue</strong><ul className="builder-task-list">{builderTasks.map((task) => <li key={task.id} className="builder-task-item"><span className={`task-status-pill ${task.status}`}>{task.status}</span><span>{task.title}</span></li>)}</ul></div>
            <div className="builder-plan-section"><strong>Activity transparency</strong><ul className="builder-activity-list">{builderActivity.map((activity) => <li key={activity.id} className="builder-activity-item"><span className={`activity-status-dot ${activity.status}`} /><span><strong>{activity.label}</strong><em>{activity.detail}</em></span></li>)}</ul></div>
            <div className="builder-workflow-actions">
              <button type="button" onClick={handleRevisePlan}>Revise plan</button>
              <button type="button" className="primary" onClick={handleApprovePlan} disabled={planApproved}>{planApproved ? "Approved" : "Approve plan"}</button>
              <button type="button" className="primary" onClick={handleExecutionPreview} disabled={!planApproved || executionPreviewed || isExecuting}>{isExecuting ? "Running..." : executionPreviewed ? "Preview complete" : "Run execution preview"}</button>
            </div>
          </div>
        </section>
        {planApproved && (
          <VerifiedEditPanel
            state={verifiedEdit}
            isRunning={isVerifiedEditRunning}
            onPrepare={handlePrepareVerifiedEdit}
            onRun={handleRunVerifiedEdit}
          />
        )}
      </>
    );
  }

  function renderCreate() {
    return (
      <main className="create-screen">
        <section className="create-hero">
          <div className="workspace-pill"><span className="live-dot" />Vivus local workspace</div>
          <h1>What do you want to build?</h1>
          <p className="hero-subtitle">Create anything. Vivus is your local AI-powered canvas.</p>
          <div className="quick-pill-row">
            {quickStarts.map((item) => <button key={item} type="button" className="quick-pill" onClick={() => setHomePrompt(`Build a ${item.toLowerCase()}`)}>{item}</button>)}
          </div>
          <form className="home-composer" onSubmit={(event) => { event.preventDefault(); createProject(homePrompt); }}>
            <textarea placeholder="Describe your idea..." value={homePrompt} onChange={(event) => setHomePrompt(event.target.value)} onKeyDown={handleKeyDown} />
            <button type="button" className="home-composer-plus" onClick={() => action("Attach files/photos")} aria-label="Attach files"><Plus size={18} strokeWidth={2.5} /></button>
            <div className="home-composer-actions">
              <button type="button" className="soft-button" onClick={() => setCurrentMode("plan")}>Plan</button>
              <button type="submit" className="send-button" aria-label="Create project"><Send size={17} strokeWidth={2.5} /></button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  function renderApps() {
    return (
      <main className="simple-page">
        <div className="page-shell">
          <div className="page-heading-row"><div><h1>Apps</h1><p>Saved local Vivus projects.</p></div><button type="button" className="soft-button" onClick={() => navigate("create")}>New Project</button></div>
          {projects.length === 0 ? (
            <div className="app-card"><div className="app-preview"><span>No saved projects yet</span></div><h2>Create your first app</h2><p>Describe an idea on the Create page and Vivus will save it locally as a project.</p><button type="button" className="soft-button" onClick={() => navigate("create")}>Create Project</button></div>
          ) : (
            <div className="project-list">{projects.map((project) => <button key={project.id} type="button" className="project-card" onClick={() => openProject(project)}><div className="project-card-topline"><span>{project.status}</span><em>{shortDate(project.updatedAt)}</em></div><h2>{project.name}</h2><p>{project.originalPrompt}</p></button>)}</div>
          )}
        </div>
      </main>
    );
  }

  function renderAccount() {
    return <main className="simple-page"><div className="account-shell"><div className="avatar">SM</div><h1>Spencer Moya</h1><p>@smgunner14</p><p>smgunner14@gmail.com</p><div className="account-section">{["Profile", "Theme - Dark", "Usage", "Notifications", "Help"].map((item) => <button key={item} type="button" className="account-row" onClick={() => action(item)}><span>{item}</span><em>›</em></button>)}</div></div></main>;
  }

  function renderEmptyBuilder() {
    return <section className="builder-empty-state"><div className="empty-composer-wrap">{activeProject && <div className="project-context-card"><span className="project-pill-dot" aria-hidden="true" /><span>Current project</span><strong>{activeProject.name}</strong><p>{activeProject.originalPrompt}</p></div>}{renderBuildComposer("initial-composer")}<div className="vivus-greeting-card"><div className="greeting-icon">V</div><div><strong>Vivus</strong><p>{greetingMessage(activeProject)}</p></div></div></div></section>;
  }

  function renderBuilderConversation() {
    return <section className="builder-conversation-state"><div className="ai-conversation"><div className="ai-message assistant-message"><strong>Vivus</strong><p>{greetingMessage(activeProject)}</p></div>{buildMessages.map((message, index) => <div key={`${message.role}-${index}`} className={`ai-message ${message.role === "user" ? "user-message" : "assistant-message"}`}><strong>{message.role === "user" ? "You" : "Vivus"}</strong><p>{message.content}</p></div>)}{renderWorkflowPanel()}<div ref={messagesEndRef} /></div><div className="bottom-composer-wrap">{renderBuildComposer("bottom-composer")}</div></section>;
  }

  function renderWorkspaceContent() {
    if (workspaceTab === "builder") return <section className={`workspace-content builder-workspace ${hasStartedConversation ? "builder-has-conversation" : "builder-is-empty"}`}>{hasStartedConversation ? renderBuilderConversation() : renderEmptyBuilder()}</section>;
    if (workspaceTab === "files") return <ProjectFilesPanel projectId={activeProjectId} />;
    if (workspaceTab === "commits") return <CommitPanel projectName={activeProject?.name ?? "Untitled Project"} />;
    if (workspaceTab === "preview") return <section className="workspace-content tool-panel-screen"><div className="tool-panel-card preview-panel-card"><div className="tool-panel-heading"><Monitor size={18} /><h2>Live Preview</h2></div><div className="preview-placeholder"><div className="preview-window"><div className="preview-window-top" /><div className="preview-window-body">Your app preview will appear here.</div></div><p>Run your project to preview changes.</p></div></div></section>;
    return <section className="workspace-content tool-panel-screen"><div className="tool-panel-card"><div className="tool-panel-heading"><Code2 size={18} /><h2>{pluginLabel(workspaceTab)}</h2></div><p className="placeholder-copy">This tool area is reserved for the future {pluginLabel(workspaceTab).toLowerCase()} system.</p></div></section>;
  }

  function renderDockTab(pluginId: OpenPlugin, canClose: boolean) {
    return <button key={pluginId} type="button" className={`dock-tab ${workspaceTab === pluginId ? "active" : ""}`} onClick={() => switchWorkspaceTab(pluginId)}>{pluginLabel(pluginId)}{canClose && <span role="button" tabIndex={0} className="dock-tab-close" onClick={(event) => { event.stopPropagation(); closePlugin(pluginId); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); closePlugin(pluginId); } }} aria-label={`Close ${pluginLabel(pluginId)}`}><X size={12} /></span>}</button>;
  }

  function renderWorkspace() {
    const defaultDockPlugins = defaultPlugins.filter((pluginId) => openPlugins.includes(pluginId));
    const extensionDockPlugins = openPlugins.filter((pluginId) => !defaultPlugins.includes(pluginId));

    return (
      <main className="workspace-screen">
        <header className="workspace-topbar">
          <div className="workspace-brand project-switcher-wrap">
            <div className="logo-box">V</div>
            <button type="button" className="project-name" onClick={() => setShowProjectMenu((open) => !open)} aria-expanded={showProjectMenu}>
              {activeProject?.name ?? "Untitled Project"} <ChevronDown size={16} strokeWidth={2.4} />
            </button>
            {showProjectMenu && <div className="project-switcher-menu">
              <div className="project-switcher-header">Projects</div>
              {projects.length === 0 ? <div className="project-switcher-empty">No saved projects yet</div> : projects.map((project) => (
                <button key={project.id} type="button" className={project.id === activeProjectId ? "project-switcher-item active" : "project-switcher-item"} onClick={() => openProject(project)}>
                  <strong>{project.name}</strong>
                  <span>{shortDate(project.updatedAt)}</span>
                </button>
              ))}
              <button type="button" className="project-switcher-new" onClick={() => { setShowProjectMenu(false); navigate("create"); }}>New Project</button>
            </div>}
          </div>
          <button type="button" onClick={() => navigate("create")} style={{ marginLeft: "auto", height: "36px", padding: "0 14px", borderRadius: "10px", border: "1px solid rgba(167, 139, 250, 0.24)", background: "rgba(255, 255, 255, 0.05)", color: "#f8fafc", fontSize: "13px", fontWeight: 600 }}>Home</button>
        </header>
        {renderWorkspaceContent()}
        <nav className="workspace-dock" aria-label="Workspace plugins">{defaultDockPlugins.map((pluginId) => renderDockTab(pluginId, false))}<div className="dock-divider" aria-hidden="true" />{extensionDockPlugins.map((pluginId) => renderDockTab(pluginId, true))}<button type="button" className="dock-plugin-launcher" onClick={() => setShowPluginLauncher((open) => !open)} aria-label="Open plugin launcher"><Plus size={18} strokeWidth={2.5} /></button></nav>
        {showPluginLauncher && <div className="plugin-launcher"><div className="plugin-launcher-header"><h3>Open Tool</h3><button type="button" className="plugin-launcher-close" onClick={() => setShowPluginLauncher(false)} aria-label="Close plugin launcher"><X size={16} /></button></div><div className="plugin-launcher-content">{availablePlugins.map((plugin) => <button key={plugin.id} type="button" className="plugin-launcher-item" onClick={() => openPlugin(plugin.id)}>{plugin.label}</button>)}</div></div>}
      </main>
    );
  }

  function renderPage() {
    if (route === "apps") return renderApps();
    if (route === "account") return renderAccount();
    if (route === "workspace") return renderWorkspace();
    return renderCreate();
  }

  return <div className="app">{renderPage()}{route !== "workspace" && <nav className="bottom-nav" aria-label="Main navigation">{bottomNav.map((item, index) => <React.Fragment key={item.route}><button className={route === item.route ? "bottom-nav-item active" : "bottom-nav-item"} onClick={() => navigate(item.route)}><span>{item.icon}</span><strong>{item.label}</strong></button>{index < bottomNav.length - 1 && <div className="nav-divider" />}</React.Fragment>)}</nav>}{toast && <div className="toast">{toast}</div>}</div>;
}