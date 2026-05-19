import React from "react";
import "./App.css";
import {
  ChevronDown,
  Code2,
  GitBranch,
  LayoutGrid,
  Monitor,
  Plus,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

type Route = "create" | "apps" | "account" | "workspace";
type WorkspaceTab = "preview" | "builder" | "commits" | "plugins" | "console" | "publish";
type OpenPlugin = WorkspaceTab;
type BuildMode = "build" | "plan";
type BuildMessage = { role: "user" | "assistant"; content: string };

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

export default function App() {
  const [route, setRoute] = React.useState<Route>(() => normalizeRoute(window.location.hash || "create"));
  const [workspaceTab, setWorkspaceTab] = React.useState<WorkspaceTab>("builder");
  const [openPlugins, setOpenPlugins] = React.useState<OpenPlugin[]>(defaultPlugins);
  const [showPluginLauncher, setShowPluginLauncher] = React.useState(false);
  const [toast, setToast] = React.useState("");
  const [buildInput, setBuildInput] = React.useState("");
  const [buildMessages, setBuildMessages] = React.useState<BuildMessage[]>([]);
  const [currentMode, setCurrentMode] = React.useState<BuildMode>("build");
  const [planApproved, setPlanApproved] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const hasStartedConversation = buildMessages.length > 0;

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
  }, [buildMessages]);

  function navigate(nextRoute: Route) {
    setRoute(nextRoute);
    window.location.hash = `/${nextRoute}`;
  }

  function action(label: string) {
    setToast(label);
  }

  function openWorkspace(label: string) {
    setToast(label);
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
      if (workspaceTab === pluginId) {
        setWorkspaceTab(next[0] ?? "builder");
      }
      return next.length ? next : defaultPlugins;
    });
  }

  function assistantReplyFor(input: string): string {
    if (currentMode === "plan") {
      return "I’ll help turn this into a build-ready plan.\n\nRequirements to confirm:\n- Core goal\n- Required screens\n- Main user flow\n- Local data behavior\n- Acceptance criteria\n\nOnce the plan is approved, Vivus can use it as the build specification.";
    }

    if (input.trim().length < 20) {
      return "I’ll use this as the starting build direction.\n\nThe request is still broad, so I would normally clarify the exact screen, behavior, and acceptance criteria before changing files.";
    }

    return "I’ll use this as the starting build specification.\n\nInitial build scope:\n- Core screen/layout\n- Primary user interaction\n- Local-first behavior where applicable\n- Basic empty/error states\n\nThe local AI execution pipeline will be connected later.";
  }

  function handleBuildSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = buildInput.trim();
    if (!trimmed) {
      setToast("Enter a build request first");
      return;
    }

    const nextMessages: BuildMessage[] = [
      ...buildMessages,
      { role: "user", content: trimmed },
      { role: "assistant", content: assistantReplyFor(trimmed) },
    ];

    setBuildMessages(nextMessages);
    setBuildInput("");
  }

  function handleApprovePlan() {
    setCurrentMode("build");
    setPlanApproved(true);
    setBuildMessages((current) => [
      ...current,
      { role: "assistant", content: "Plan approved. I’ll now use this as the build specification." },
    ]);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function renderModeSelector() {
    return (
      <button
        type="button"
        className="mode-selector"
        onClick={() => setCurrentMode((mode) => (mode === "build" ? "plan" : "build"))}
        aria-label="Toggle build mode"
      >
        <span>{currentMode === "build" ? "Build" : "Plan"}</span>
        <ChevronDown size={13} strokeWidth={2.5} />
      </button>
    );
  }

  function renderBuildComposer(extraClass = "") {
    return (
      <form onSubmit={handleBuildSubmit} className={`ai-builder-input-form ${extraClass}`.trim()}>
        <textarea
          placeholder={currentMode === "plan" ? "Describe your requirements and goals..." : "Make, test, iterate..."}
          value={buildInput}
          onChange={(event) => setBuildInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />

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

  function renderCreate() {
    return (
      <main className="create-screen">
        <section className="create-hero">
          <div className="workspace-pill">
            <span className="live-dot" />
            Vivus local workspace
          </div>

          <h1>What do you want to build?</h1>
          <p className="hero-subtitle">Create anything. Vivus is your local AI-powered canvas.</p>

          <div className="quick-pill-row">
            {quickStarts.map((item) => (
              <button key={item} type="button" className="quick-pill" onClick={() => action(`${item} selected`)}>
                {item}
              </button>
            ))}
          </div>

          <div className="home-composer">
            <textarea placeholder="Describe your idea..." />
            <button type="button" className="home-composer-plus" onClick={() => action("Attach files/photos")} aria-label="Attach files">
              <Plus size={18} strokeWidth={2.5} />
            </button>
            <div className="home-composer-actions">
              <button type="button" className="soft-button" onClick={() => action("Plan")}>Plan</button>
              <button type="button" className="send-button" onClick={() => openWorkspace("Opening Vivus workspace") } aria-label="Open workspace">
                <Send size={17} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  function renderApps() {
    return (
      <main className="simple-page">
        <div className="page-shell">
          <h1>Apps</h1>

          <button type="button" className="list-row" onClick={() => action("All Apps") }>
            <span>▦</span>
            <strong>All Apps</strong>
            <em>›</em>
          </button>

          <div className="app-card">
            <div className="app-preview">
              <span>Vivus project preview</span>
            </div>
            <h2>Example Local App</h2>
            <p>Placeholder project card. Real persistence will be added later.</p>
            <button type="button" className="soft-button" onClick={() => openWorkspace("Opening placeholder app")}>Open</button>
          </div>
        </div>
      </main>
    );
  }

  function renderAccount() {
    return (
      <main className="simple-page">
        <div className="account-shell">
          <div className="avatar">SM</div>
          <h1>Spencer Moya</h1>
          <p>@smgunner14</p>
          <p>smgunner14@gmail.com</p>

          <div className="account-section">
            {["Profile", "Theme - Dark", "Usage", "Notifications", "Help"].map((item) => (
              <button key={item} type="button" className="account-row" onClick={() => action(item)}>
                <span>{item}</span>
                <em>›</em>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  function renderEmptyBuilder() {
    return (
      <section className="builder-empty-state">
        <div className="empty-composer-wrap">
          {renderBuildComposer("initial-composer")}
          <div className="vivus-greeting-card">
            <div className="greeting-icon">V</div>
            <div>
              <strong>Vivus</strong>
              <p>What would you like to build today?</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderBuilderConversation() {
    return (
      <section className="builder-conversation-state">
        <div className="ai-conversation">
          <div className="ai-message assistant-message">
            <strong>Vivus</strong>
            <p>What would you like to build today?</p>
          </div>

          {buildMessages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`ai-message ${message.role === "user" ? "user-message" : "assistant-message"}`}>
              <strong>{message.role === "user" ? "You" : "Vivus"}</strong>
              <p>{message.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="bottom-composer-wrap">
          {renderBuildComposer("bottom-composer")}
          {currentMode === "plan" && buildMessages.length > 1 && !planApproved && (
            <button type="button" className="approve-plan-button" onClick={handleApprovePlan}>
              Approve Plan
            </button>
          )}
        </div>
      </section>
    );
  }

  function renderWorkspaceContent() {
    if (workspaceTab === "builder") {
      return <section className="workspace-content builder-workspace">{hasStartedConversation ? renderBuilderConversation() : renderEmptyBuilder()}</section>;
    }

    if (workspaceTab === "preview") {
      return (
        <section className="workspace-content tool-panel-screen">
          <div className="tool-panel-card preview-panel-card">
            <div className="tool-panel-heading">
              <Monitor size={18} />
              <h2>Live Preview</h2>
            </div>
            <div className="preview-placeholder">
              <div className="preview-window">
                <div className="preview-window-top" />
                <div className="preview-window-body">Your app preview will appear here.</div>
              </div>
              <p>Run your project to preview changes.</p>
            </div>
          </div>
        </section>
      );
    }

    if (workspaceTab === "commits") {
      return (
        <section className="workspace-content tool-panel-screen">
          <div className="tool-panel-card">
            <div className="tool-panel-heading">
              <GitBranch size={18} />
              <h2>Commits</h2>
            </div>
            <div className="commit-grid">
              {[
                ["Pending Changes", "UI improvements pending", "2m"],
                ["Checkpoint", "Workspace shell stabilized", "15m"],
                ["Timeline", "Create screen redesign", "Yesterday"],
              ].map(([title, description, time]) => (
                <div key={title} className="change-item">
                  <div>
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </div>
                  <em>{time}</em>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="workspace-content tool-panel-screen">
        <div className="tool-panel-card">
          <div className="tool-panel-heading">
            <Code2 size={18} />
            <h2>{pluginLabel(workspaceTab)}</h2>
          </div>
          <p className="placeholder-copy">This tool area is reserved for the future {pluginLabel(workspaceTab).toLowerCase()} system.</p>
        </div>
      </section>
    );
  }

  function renderWorkspace() {
    return (
      <main className="workspace-screen">
        <header className="workspace-topbar">
          <div className="workspace-brand">
            <div className="logo-box">V</div>
            <button type="button" className="project-name" onClick={() => action("Project menu") }>
              Untitled Project <ChevronDown size={16} strokeWidth={2.4} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => navigate("create")}
            style={{
              marginLeft: "auto",
              height: "36px",
              padding: "0 14px",
              borderRadius: "10px",
              border: "1px solid rgba(167, 139, 250, 0.24)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#f8fafc",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Home
          </button>
        </header>

        {renderWorkspaceContent()}

        <nav className="workspace-dock" aria-label="Workspace plugins">
          {openPlugins.map((pluginId) => (
            <button
              key={pluginId}
              type="button"
              className={`dock-tab ${workspaceTab === pluginId ? "active" : ""}`}
              onClick={() => switchWorkspaceTab(pluginId)}
            >
              {pluginLabel(pluginId)}
              {!defaultPlugins.includes(pluginId) && (
                <span
                  role="button"
                  tabIndex={0}
                  className="dock-tab-close"
                  onClick={(event) => {
                    event.stopPropagation();
                    closePlugin(pluginId);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      closePlugin(pluginId);
                    }
                  }}
                  aria-label={`Close ${pluginLabel(pluginId)}`}
                >
                  <X size={12} />
                </span>
              )}
            </button>
          ))}

          <div className="dock-divider" aria-hidden="true" />

          <button type="button" className="dock-plugin-launcher" onClick={() => setShowPluginLauncher((open) => !open)} aria-label="Open plugin launcher">
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </nav>

        {showPluginLauncher && (
          <div className="plugin-launcher">
            <div className="plugin-launcher-header">
              <h3>Open Tool</h3>
              <button type="button" className="plugin-launcher-close" onClick={() => setShowPluginLauncher(false)} aria-label="Close plugin launcher">
                <X size={16} />
              </button>
            </div>
            <div className="plugin-launcher-content">
              {availablePlugins.map((plugin) => (
                <button key={plugin.id} type="button" className="plugin-launcher-item" onClick={() => openPlugin(plugin.id)}>
                  {plugin.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    );
  }

  function renderPage() {
    if (route === "apps") return renderApps();
    if (route === "account") return renderAccount();
    if (route === "workspace") return renderWorkspace();
    return renderCreate();
  }

  return (
    <div className="app">
      {renderPage()}

      {route !== "workspace" && (
        <nav className="bottom-nav" aria-label="Main navigation">
          {bottomNav.map((item, index) => (
            <React.Fragment key={item.route}>
              <button className={route === item.route ? "bottom-nav-item active" : "bottom-nav-item"} onClick={() => navigate(item.route)}>
                <span>{item.icon}</span>
                <strong>{item.label}</strong>
              </button>
              {index < bottomNav.length - 1 && <div className="nav-divider" />}
            </React.Fragment>
          ))}
        </nav>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
