import React from "react";
import "./App.css";
import { LayoutGrid, Sparkles, UserRound } from "lucide-react";

type Route = "create" | "apps" | "account" | "workspace";
type WorkspaceTab = "preview" | "ai-builder" | "plugins";

const quickStarts = ["Website", "Desktop App", "AI Tool", "Automation", "API", "Game", "Utility"];

const bottomNav: Array<{ route: Route; label: string; icon: React.ReactNode }> = [
  { route: "apps", label: "Apps", icon: <LayoutGrid size={20} strokeWidth={2} /> },
  { route: "create", label: "Create", icon: <Sparkles size={20} strokeWidth={2} /> },
  { route: "account", label: "Account", icon: <UserRound size={20} strokeWidth={2} /> },
];

const workspaceTabs: Array<{ key: WorkspaceTab; label: string }> = [
  { key: "preview", label: "Preview" },
  { key: "ai-builder", label: "AI Builder" },
  { key: "plugins", label: "Plugins" },
];

function normalizeRoute(value: string): Route {
  const cleaned = value.replace("#", "").replace("/", "").trim().toLowerCase();
  if (cleaned === "apps") return "apps";
  if (cleaned === "account") return "account";
  if (cleaned === "workspace") return "workspace";
  return "create";
}

export default function App() {
  const [route, setRoute] = React.useState<Route>(() => normalizeRoute(window.location.hash || "create"));
  const [workspaceTab, setWorkspaceTab] = React.useState<WorkspaceTab>("ai-builder");
  const [toast, setToast] = React.useState("");

  React.useEffect(() => {
    const handleHash = () => setRoute(normalizeRoute(window.location.hash || "create"));
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  function navigate(nextRoute: Route) {
    setRoute(nextRoute);
    window.location.hash = `/${nextRoute}`;
  }

  function action(label: string) {
    setToast(`Placeholder action: ${label}`);
  }

  function openWorkspace(label: string) {
    setToast(label);
    navigate("workspace");
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

          <div className="composer">
            <textarea placeholder="Describe your idea..." />
            <div className="composer-footer">
              <button type="button" className="composer-plus" onClick={() => action("Attach files/photos")}>
                +
              </button>

              <div className="composer-actions">
                <button type="button" className="soft-button" onClick={() => action("Plan")}>
                  Plan
                </button>
                <button type="button" className="send-button" onClick={() => openWorkspace("Opening Vivus workspace.~")}>
                  →
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="forge-card">
          <div className="forge-card-icon">✦</div>
          <h2>Vivus</h2>
          <p>Your local AI engineering workspace.</p>

          <div className="forge-feature">
            <strong>100% local</strong>
            <span>Your data stays on your machine.</span>
          </div>

          <div className="forge-feature">
            <strong>AI native</strong>
            <span>Built for agent-assisted development.</span>
          </div>

          <div className="forge-feature">
            <strong>Expandable</strong>
            <span>Designed for models, tools, and workflows.</span>
          </div>
        </aside>
      </main>
    );
  }

  function renderApps() {
    return (
      <main className="simple-page">
        <div className="page-shell">
          <h1>Apps</h1>

          <button type="button" className="list-row" onClick={() => action("All Apps")}>
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
            <button type="button" className="soft-button" onClick={() => openWorkspace("Opening placeholder app.~")}>
              Open
            </button>
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

  function renderWorkspaceContent() {
    if (workspaceTab === "preview") {
      return (
        <section className="workspace-panel large-panel">
          <div className="placeholder-icon">▭</div>
          <h2>Live preview will appear here</h2>
          <p>Run your project to see a live preview once execution is connected.</p>
        </section>
      );
    }

    if (workspaceTab === "ai-builder") {
      return (
        <section className="workspace-panel ai-builder-panel">
          <h2>AI Builder</h2>
          <div className="ai-builder-content">
            <div className="ai-builder-input">
              <textarea placeholder="Describe what you want to build..." />
              <button type="button" className="send-button" onClick={() => action("AI build request")}>
                →
              </button>
            </div>
            <div className="ai-builder-response">
              <div className="ai-response-message">
                <strong>Vivus Agent</strong>
                <p>Understood. I'll help you build that. What's your project structure?</p>
              </div>
              <div className="ai-response-message">
                <strong>You</strong>
                <p>Let's create a React app with a todo list feature.</p>
              </div>
              <div className="ai-response-message">
                <strong>Vivus Agent</strong>
                <p>Great! I'll generate the project structure and files for a React todo app.</p>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (workspaceTab === "plugins") {
      return (
        <section className="workspace-panel plugins-panel">
          <h2>Plugins</h2>
          <div className="plugins-content">
            <div className="pending-changes">
              <h3>Pending Changes</h3>
              <div className="change-item">
                <div className="change-description">Added new component: TodoItem</div>
                <div className="change-meta">
                  <span className="duration">2m</span>
                  <span className="time">10:30 AM</span>
                </div>
              </div>
              <div className="change-item">
                <div className="change-description">Updated package.json dependencies</div>
                <div className="change-meta">
                  <span className="duration">5m</span>
                  <span className="time">10:25 AM</span>
                </div>
              </div>
            </div>
            
            <div className="commit-timeline">
              <h3>GitHub Commit Timeline</h3>
              <div className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title">feat: add todo list feature</div>
                  <div className="timeline-time">Yesterday, 10:15 AM</div>
                </div>
                <div className="timeline-changes">
                  <div className="change-file">src/components/TodoList.tsx</div>
                  <div className="change-file">src/components/TodoItem.tsx</div>
                  <div className="change-file">src/App.tsx</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title">chore: update dependencies</div>
                  <div className="timeline-time">2 days ago</div>
                </div>
                <div className="timeline-changes">
                  <div className="change-file">package.json</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="workspace-panel ai-builder-panel">
        <h2>AI Builder</h2>
        <div className="ai-builder-content">
          <div className="ai-builder-input">
            <textarea placeholder="Describe what you want to build..." />
            <button type="button" className="send-button" onClick={() => action("AI build request")}>
              →
            </button>
          </div>
          <div className="ai-builder-response">
            <div className="ai-response-message">
              <strong>Vivus Agent</strong>
              <p>Understood. I'll help you build that. What's your project structure?</p>
            </div>
          </div>
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
            <button type="button" className="project-name" onClick={() => action("Project menu")}>
              My Project⌄
            </button>
          </div>

          <div className="workspace-actions">
            <button type="button" className="soft-button" onClick={() => navigate("create")}>
              Back to Create
            </button>
            <button type="button" className="soft-button" onClick={() => action("Share")}>
              Share
            </button>
            <button type="button" className="primary-button" onClick={() => action("Run")}>
              Run
            </button>
          </div>
        </header>

        <nav className="workspace-tabs">
          {workspaceTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={workspaceTab === tab.key ? "workspace-tab active" : "workspace-tab"}
              onClick={() => {
                setWorkspaceTab(tab.key);
                action(`${tab.label} selected`);
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {renderWorkspaceContent()}

        <div className="workspace-dock">
          {workspaceTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={workspaceTab === tab.key ? "dock-tab active" : "dock-tab"}
              onClick={() => {
                setWorkspaceTab(tab.key);
                action(`${tab.label} selected`);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </main>
    );
  }

  function renderPage() {
    if (route === "apps") return renderApps();
    if (route === "account") return renderAccount();
    if (route === "workspace") return renderWorkspace();
    return renderCreate();
  }

  const showBottomNav = route !== "workspace";

  return (
    <div className="app">
      {renderPage()}

      {showBottomNav && (
        <nav className="bottom-nav" aria-label="Main navigation">
          {bottomNav.map((item) => (
            <button
              key={item.route}
              type="button"
              className={route === item.route ? "bottom-nav-item active" : "bottom-nav-item"}
              onClick={() => navigate(item.route)}
            >
              <span>{item.icon}</span>
              <strong>{item.label}</strong>
            </button>
          ))}
        </nav>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
