import React from "react";
import "./App.css";

type Route = "create" | "apps" | "account" | "workspace";
type WorkspaceTab = "agent" | "preview" | "console" | "git" | "publish" | "more";

const quickStarts = ["Website", "Desktop App", "AI Tool", "Automation", "API", "Game", "Utility"];

const bottomNav: Array<{ route: Route; label: string; icon: string }> = [
  { route: "apps", label: "Apps", icon: "▦" },
  { route: "create", label: "Create", icon: "⌂" },
  { route: "account", label: "Account", icon: "♙" },
];

const workspaceTabs: Array<{ key: WorkspaceTab; label: string }> = [
  { key: "agent", label: "Agent" },
  { key: "preview", label: "Preview" },
  { key: "console", label: "Console" },
  { key: "git", label: "Git" },
  { key: "publish", label: "Publish" },
  { key: "more", label: "More" },
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
  const [workspaceTab, setWorkspaceTab] = React.useState<WorkspaceTab>("agent");
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
            ForgeOS local workspace
          </div>

          <h1>What do you want to build?</h1>
          <p className="hero-subtitle">Create anything. ForgeOS is your local AI-powered canvas.</p>

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
                <button type="button" className="send-button" onClick={() => openWorkspace("Opening ForgeOS workspace...")}>
                  →
                </button>
              </div>
            </div>
          </div>

          <section className="recent-block">
            <h2>Recent Projects</h2>
            <div className="empty-recent">
              <p>No recent projects yet.</p>
              <span>Start a new project to see it here.</span>
            </div>
          </section>
        </section>

        <aside className="forge-card">
          <div className="forge-card-icon">✦</div>
          <h2>ForgeOS</h2>
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
              <span>ForgeOS project preview</span>
            </div>
            <h2>Example Local App</h2>
            <p>Placeholder project card. Real persistence will be added later.</p>
            <button type="button" className="soft-button" onClick={() => openWorkspace("Opening placeholder app...")}>
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
          <h2>Preview will appear here</h2>
          <p>Run your project to see a live preview once execution is connected.</p>
        </section>
      );
    }

    if (workspaceTab === "console") {
      return (
        <section className="workspace-panel terminal-panel">
          <h2>Console</h2>
          <pre>{`> ForgeOS console shell
> Command execution will be added later.
> Ready.`}</pre>
        </section>
      );
    }

    if (workspaceTab === "git") {
      return (
        <section className="workspace-panel large-panel">
          <h2>Git</h2>
          <p>Branches, commits, diffs, and sync controls will appear here later.</p>
          <div className="mini-grid">
            <div>Current branch: main</div>
            <div>Changes: placeholder</div>
            <div>Remote: not connected</div>
          </div>
        </section>
      );
    }

    if (workspaceTab === "publish") {
      return (
        <section className="workspace-panel large-panel">
          <h2>Publish</h2>
          <p>Deployment, visibility, domains, and release settings will be added later.</p>
          <button type="button" className="primary-button" onClick={() => action("Publish placeholder")}>
            Publish Placeholder
          </button>
        </section>
      );
    }

    if (workspaceTab === "more") {
      return (
        <section className="workspace-panel large-panel">
          <h2>More</h2>
          <p>Workspace settings, resources, extensions, and advanced tools will appear here.</p>
          <div className="mini-grid">
            <div>Resources</div>
            <div>Extensions</div>
            <div>Settings</div>
          </div>
        </section>
      );
    }

    return (
      <section className="workspace-grid">
        <aside className="agent-panel">
          <h2>Agent</h2>
          <div className="agent-message">
            <strong>ForgeOS Agent</strong>
            <p>I’m your local AI agent. How can I help you build today?</p>
          </div>

          <div className="agent-steps">
            <span>Planning project structure</span>
            <span>Preparing editor shell</span>
            <span>Waiting for model integration</span>
          </div>

          <div className="agent-input">
            <input placeholder="Ask the agent anything..." />
            <button type="button" onClick={() => action("Agent send")}>
              →
            </button>
          </div>
        </aside>

        <section className="editor-panel">
          <div className="editor-tab">main.tsx</div>
          <pre className="code-preview">{`1  // Your code will appear here
2
3  function App() {
4    return <ForgeOS />;
5  }`}</pre>

          <div className="console-strip">
            <span>Console</span>
            <code>&gt; Ready.</code>
            <span className="status-green" />
          </div>
        </section>

        <aside className="preview-panel">
          <div className="placeholder-icon">▭</div>
          <h2>Preview</h2>
          <p>Your running app preview will appear here later.</p>
        </aside>
      </section>
    );
  }

  function renderWorkspace() {
    return (
      <main className="workspace-screen">
        <header className="workspace-topbar">
          <div className="workspace-brand">
            <div className="logo-box">F</div>
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

        <div className="workspace-bottom-nav">
          {workspaceTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={workspaceTab === tab.key ? "bottom-tab active" : "bottom-tab"}
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
