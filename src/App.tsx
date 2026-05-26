import React from "react";
import "./App.css";
import "./BuilderLifecycle.css";
import "./BuilderWorkflow.css";
import "./VerifiedEditPanel.css";
import { CommitPanel } from "./CommitPanel";
import { ProjectFilesPanel, initializeProjectFiles } from "./ProjectFilesPanel";
import { WorkspacePreviewPanel } from "./WorkspacePreviewPanel";
import { AccountPage } from "./pages/AccountPage";
import { AppsPage } from "./pages/AppsPage";
import { VivusWorkspaceUI } from "./ui/VivusWorkspaceUI";
import { useAppWorkspaceRuntime } from "./AppWorkspaceRuntime";
import { createWorkspace } from "./workspace/workspaceController";
import { activateWorkspaceById } from "./workspaceSwitcherController";
import {
  type VerifiedEditState,
} from "./vivusExecutionLoop";
import {
  ChevronDown,
  Code2,
  LayoutGrid,
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
  const workspaceRuntime = useAppWorkspaceRuntime();
  const projects = workspaceRuntime.projects;
  const activeProjectId = workspaceRuntime.activeProjectId;
  const activeProject = workspaceRuntime.activeProject;

  const [route, setRoute] = React.useState<Route>(() => normalizeRoute(window.location.hash || "create"));
  const [workspaceTab, setWorkspaceTab] = React.useState<WorkspaceTab>("builder");
  const [openPlugins, setOpenPlugins] = React.useState<OpenPlugin[]>(defaultPlugins);
  const [showPluginLauncher, setShowPluginLauncher] = React.useState(false);
  const [showProjectMenu, setShowProjectMenu] = React.useState(false);
  const [toast, setToast] = React.useState("");
  const [homePrompt, setHomePrompt] = React.useState("");
  const [buildInput, setBuildInput] = React.useState("");
  const [buildMessages, setBuildMessages] = React.useState<BuildMessage[]>([]);
  const [currentMode, setCurrentMode] = React.useState<BuildMode>("build");
  const [_, setPlanApproved] = React.useState(false);
  const [builderPlan, setBuilderPlan] = React.useState<BuilderPlan | null>(null);
  const [builderTasks, setBuilderTasks] = React.useState<BuilderTask[]>([]);
  const [builderActivity, setBuilderActivity] = React.useState<BuilderActivity[]>([]);
  const [__, setIsExecuting] = React.useState(false);
  const [verifiedEdit, setVerifiedEdit] = React.useState<VerifiedEditState | null>(null);
  const [
  ___,
  setIsVerifiedEditRunning,
] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleHash = () => setRoute(normalizeRoute(window.location.hash || "create"));
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

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

  function resetBuilderWorkflow() {
    setBuildInput("");
    setPlanApproved(false);
    setBuilderPlan(null);
    setBuilderTasks([]);
    setBuilderActivity([]);
    setIsExecuting(false);
    setVerifiedEdit(null);
    setIsVerifiedEditRunning(false);
  }

  function seedWorkspace(project: ProjectRecord | null, startWithPrompt = false) {
    initializeProjectFiles();
    setWorkspaceTab("builder");
    setShowProjectMenu(false);
    resetBuilderWorkflow();
    setBuildMessages(
      startWithPrompt && project
        ? [
            { role: "user", content: project.originalPrompt },
            { role: "assistant", content: `Workspace opened locally.\n\nWorkspace: ${project.name}\n\nStarter files are ready in the Files tab. I’ll use this as the starting build specification.` },
          ]
        : []
    );
  }

  async function createProject(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setToast("Describe the workspace or path first");
      return;
    }

    const result = await createWorkspace(trimmed);
    if (!result.ok) {
      setToast(result.reason ?? "Workspace could not be created");
      return;
    }

    initializeProjectFiles();
    setHomePrompt("");
    seedWorkspace(
      {
        id: result.projectId ?? "",
        name: "Workspace",
        originalPrompt: trimmed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "active",
      },
      true
    );
    navigate("workspace");
    setToast("Workspace created");
  }

  function openProject(project: ProjectRecord) {
    const switched = activateWorkspaceById(project.id);
    if (!switched) {
      setToast("Workspace could not be opened");
      return;
    }

    initializeProjectFiles();
    seedWorkspace(project, false);
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
    setVerifiedEdit(null);
    setBuilderTasks(makeTasks("approved"));
    setBuilderActivity(makeActivity("approved"));
    setBuildMessages((current) => [...current, { role: "assistant", content: "Plan approved. The execution queue is staged and source verification is next." }]);
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
            <textarea placeholder="Describe your idea or paste a local project path..." value={homePrompt} onChange={(event) => setHomePrompt(event.target.value)} onKeyDown={handleKeyDown} />
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
      <AppsPage
        projects={projects}
        shortDate={shortDate}
        onOpenProject={openProject}
        onNavigateCreate={() => navigate("create")}
      />
    );
  }

  function renderAccount() {    return <AccountPage onAction={action} />;  }  function renderWorkspaceContent() {
  if (workspaceTab === "builder") {
    return (
      <section className="workspace-content builder-workspace">
        <VivusWorkspaceUI
          activeProject={activeProject}
          buildInput={buildInput}
          setBuildInput={setBuildInput}
          handleKeyDown={handleKeyDown}
          onPreparePatch={
            builderPlan
              ? handleApprovePlan
              : () =>
                  handleBuildSubmit({
                    preventDefault() {},
                  } as React.FormEvent)
          }
        />
      </section>
    );
  }

  if (workspaceTab === "files") {
    return (
      <ProjectFilesPanel
        projectId={activeProjectId}
      />
    );
  }

  if (workspaceTab === "commits") {
    return (
      <CommitPanel
        projectName={
          activeProject?.name ??
          "Untitled Project"
        }
      />
    );
  }

  if (workspaceTab === "preview") {
    return (
      <WorkspacePreviewPanel />
    );
  }

  return (
    <section className="workspace-content tool-panel-screen">
      <div className="tool-panel-card">
        <div className="tool-panel-heading">
          <Code2 size={18} />
          <h2>
            {pluginLabel(workspaceTab)}
          </h2>
        </div>

        <p className="placeholder-copy">
          This tool area is reserved
          for the future{" "}
          {pluginLabel(
            workspaceTab
          ).toLowerCase()}{" "}
          system.
        </p>
      </div>
    </section>
  );
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
              {activeProject?.name ?? "No Workspace Selected"} <ChevronDown size={16} strokeWidth={2.4} />
            </button>
            {showProjectMenu && <div className="project-switcher-menu">
              <div className="project-switcher-header">Workspaces</div>
              {projects.length === 0 ? <div className="project-switcher-empty">No saved workspaces yet</div> : projects.map((project) => (
                <button key={project.id} type="button" className={project.id === activeProjectId ? "project-switcher-item active" : "project-switcher-item"} onClick={() => openProject(project)}>
                  <strong>{project.name}</strong>
                  <span>{shortDate(project.updatedAt)}</span>
                </button>
              ))}
              <button type="button" className="project-switcher-new" onClick={() => { setShowProjectMenu(false); navigate("create"); }}>New Workspace</button>
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












