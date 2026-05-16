import React from "react";
import "./App.css";
import { LayoutGrid, Sparkles, UserRound, Share2, Play, Settings, Monitor, Smartphone, Globe, Plus, X } from "lucide-react";

type Route = "create" | "apps" | "account" | "workspace";
type WorkspaceTab = "preview" | "builder" | "plugins";
type OpenPlugin = "builder" | "preview" | "plugins" | "console" | "git" | "publish";

const quickStarts = ["Website", "Desktop App", "AI Tool", "Automation", "API", "Game", "Utility"];

const bottomNav: Array<{ route: Route; label: string; icon: React.ReactNode }> = [
  { route: "apps", label: "Apps", icon: <LayoutGrid size={20} strokeWidth={2} /> },
  { route: "create", label: "Create", icon: <Sparkles size={20} strokeWidth={2} /> },
  { route: "account", label: "Account", icon: <UserRound size={20} strokeWidth={2} /> },
];

const workspaceTabs: Array<{ key: WorkspaceTab; label: string }> = [
  { key: "preview", label: "Preview" },
  { key: "builder", label: "Builder" },
  { key: "plugins", label: "Plugins" },
];

const availablePlugins = [
  { id: "builder", label: "AI Builder" },
  { id: "preview", label: "Live Preview" },
  { id: "plugins", label: "Plugins" },
  { id: "console", label: "Console" },
  { id: "git", label: "Git Timeline" },
  { id: "publish", label: "Publish" },
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
  const [workspaceTab, setWorkspaceTab] = React.useState<WorkspaceTab>("builder");
  const [openPlugins, setOpenPlugins] = React.useState<OpenPlugin[]>(["builder", "preview", "plugins"]);
  const [showPluginLauncher, setShowPluginLauncher] = React.useState(false);
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

  function switchWorkspaceTab(tab: WorkspaceTab) {
    setWorkspaceTab(tab);
    action(`${tab} selected`);
  }

  function openPlugin(pluginId: OpenPlugin) {
    if (!openPlugins.includes(pluginId)) {
      setOpenPlugins([...openPlugins, pluginId]);
    }
    setWorkspaceTab(pluginId as WorkspaceTab);
    setShowPluginLauncher(false);
    action(`${pluginId} opened`);
  }

  function closePlugin(pluginId: OpenPlugin) {
    if (openPlugins.length <= 1) return;
    
    const newPlugins = openPlugins.filter(id => id !== pluginId);
    setOpenPlugins(newPlugins);
    
    if (workspaceTab === pluginId) {
      // Switch to the first remaining plugin
      setWorkspaceTab(newPlugins[0] as WorkspaceTab);
    }
    
    action(`${pluginId} closed`);
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
        <section className="workspace-grid">
          <aside className="preview-panel">
            <h2>Live Preview</h2>
            <div className="preview-placeholder">
              <div className="preview-icon">▭</div>
              <p>Your app preview will appear here.</p>
              <p className="preview-subtext">Run your project to preview changes.</p>
              
              <div className="device-toggle">
                <button className="device-btn active">
                  <Monitor size={16} />
                </button>
                <button className="device-btn">
                  <Smartphone size={16} />
                </button>
                <button className="device-btn">
                  <Globe size={16} />
                </button>
              </div>
            </div>
          </aside>

          <section className="builder-panel">
            <div className="ai-builder-content">
              <div className="ai-builder-header">
                <h2>Build with Vivus</h2>
                <p>Describe what you want to build.</p>
              </div>
              
              <div className="ai-builder-input">
                <textarea placeholder="Describe what you want to build..." />
                <button type="button" className="send-button" onClick={() => action("AI build request")}>
                  →
                </button>
              </div>
              
              <div className="ai-conversation">
                <div className="ai-message">
                  <strong>Vivus</strong>
                  <p>What would you like to build today?</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="plugins-panel">
            <h2>Project Activity</h2>
            <div className="plugins-content">
              <div className="pending-changes">
                <h3>Pending Changes</h3>
                <div className="change-item">
                  <div className="change-description">UI improvements pending</div>
                  <div className="change-meta">
                    <span className="duration">2m</span>
                    <span className="time">10:30 AM</span>
                  </div>
                </div>
                <div className="change-item">
                  <div className="change-description">Workspace initialization</div>
                  <div className="change-meta">
                    <span className="duration">5m</span>
                    <span className="time">10:25 AM</span>
                  </div>
                </div>
                <div className="change-item">
                  <div className="change-description">Plugin sync pending</div>
                  <div className="change-meta">
                    <span className="duration">10m</span>
                    <span className="time">10:20 AM</span>
                  </div>
                </div>
              </div>
              
              <div className="commit-timeline">
                <h3>Commit Timeline</h3>
                <div className="timeline-item">
                  <div className="timeline-header">
                    <div className="timeline-title">2 min ago</div>
                    <div className="timeline-time">Workspace created</div>
                  </div>
                  <div className="timeline-duration">Duration: 1m 42s</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-header">
                    <div className="timeline-title">15 min ago</div>
                    <div className="timeline-time">UI refinement pass</div>
                  </div>
                  <div className="timeline-duration">Duration: 4m 11s</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-header">
                    <div className="timeline-title">Yesterday</div>
                    <div className="timeline-time">Create screen redesign</div>
                  </div>
                  <div className="timeline-duration">Duration: 22m</div>
                </div>
              </div>
            </div>
          </aside>
        </section>
      );
    }

    if (workspaceTab === "builder") {
      return (
        <section className="workspace-grid">
          <aside className="preview-panel">
            <h2>Live Preview</h2>
            <div className="preview-placeholder">
              <div className="preview-icon">▭</div>
              <p>Your app preview will appear here.</p>
              <p className="preview-subtext">Run your project to preview changes.</p>
              
              <div className="device-toggle">
                <button className="device-btn active">
                  <Monitor size={16} />
                </button>
                <button className="device-btn">
                  <Smartphone size={16} />
                </button>
                <button className="device-btn">
                  <Globe size={16} />
                </button>
              </div>
            </div>
          </aside>

          <section className="builder-panel">
            <div className="ai-builder-content">
              <div className="ai-builder-header">
                <h2>Build with Vivus</h2>
                <p>Describe what you want to build.</p>
              </div>
              
              <div className="ai-builder-input">
                <textarea placeholder="Describe what you want to build..." />
                <button type="button" className="send-button" onClick={() => action("AI build request")}>
                  →
                </button>
              </div>
              
              <div className="ai-conversation">
                <div className="ai-message">
                  <strong>Vivus</strong>
                  <p>What would you like to build today?</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="plugins-panel">
            <h2>Project Activity</h2>
            <div className="plugins-content">
              <div className="pending-changes">
                <h3>Pending Changes</h3>
                <div className="change-item">
                  <div className="change-description">UI improvements pending</div>
                  <div className="change-meta">
                    <span className="duration">2m</span>
                    <span className="time">10:30 AM</span>
                  </div>
                </div>
                <div className="change-item">
                  <div className="change-description">Workspace initialization</div>
                  <div className="change-meta">
                    <span className="duration">5m</span>
                    <span className="time">10:25 AM</span>
                  </div>
                </div>
                <div className="change-item">
                  <div className="change-description">Plugin sync pending</div>
                  <div className="change-meta">
                    <span className="duration">10m</span>
                    <span className="time">10:20 AM</span>
                  </div>
                </div>
              </div>
              
              <div className="commit-timeline">
                <h3>Commit Timeline</h3>
                <div className="timeline-item">
                  <div className="timeline-header">
                    <div className="timeline-title">2 min ago</div>
                    <div className="timeline-time">Workspace created</div>
                  </div>
                  <div className="timeline-duration">Duration: 1m 42s</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-header">
                    <div className="timeline-title">15 min ago</div>
                    <div className="timeline-time">UI refinement pass</div>
                  </div>
                  <div className="timeline-duration">Duration: 4m 11s</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-header">
                    <div className="timeline-title">Yesterday</div>
                    <div className="timeline-time">Create screen redesign</div>
                  </div>
                  <div className="timeline-duration">Duration: 22m</div>
                </div>
              </div>
            </div>
          </aside>
        </section>
      );
    }

    if (workspaceTab === "plugins") {
      return (
        <section className="workspace-grid">
          <aside className="preview-panel">
            <h2>Live Preview</h2>
            <div className="preview-placeholder">
              <div className="preview-icon">▭</div>
              <p>Your app preview will appear here.</p>
              <p className="preview-subtext">Run your project to preview changes.</p>
              
              <div className="device-toggle">
                <button className="device-btn active">
                  <Monitor size={16} />
                </button>
                <button className="device-btn">
                  <Smartphone size={16} />
                </button>
                <button className="device-btn">
                  <Globe size={16} />
                </button>
              </div>
            </div>
          </aside>

          <section className="builder-panel">
            <div className="ai-builder-content">
              <div className="ai-builder-header">
                <h2>Build with Vivus</h2>
                <p>Describe what you want to build.</p>
              </div>
              
              <div className="ai-builder-input">
                <textarea placeholder="Describe what you want to build..." />
                <button type="button" className="send-button" onClick={() => action("AI build request")}>
                  →
                </button>
              </div>
              
              <div className="ai-conversation">
                <div className="ai-message">
                  <strong>Vivus</strong>
                  <p>What would you like to build today?</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="plugins-panel">
            <h2>Project Activity</h2>
            <div className="plugins-content">
              <div className="pending-changes">
                <h3>Pending Changes</h3>
                <div className="change-item">
                  <div className="change-description">UI improvements pending</div>
                  <div className="change-meta">
                    <span className="duration">2m</span>
                    <span className="time">10:30 AM</span>
                  </div>
                </div>
                <div className="change-item">
                  <div className="change-description">Workspace initialization</div>
                  <div className="change-meta">
                    <span className="duration">5m</span>
                    <span className="time">10:25 AM</span>
                  </div>
                </div>
                <div className="change-item">
                  <div className="change-description">Plugin sync pending</div>
                  <div className="change-meta">
                    <span className="duration">10m</span>
                    <span className="time">10:20 AM</span>
                  </div>
                </div>
              </div>
              
              <div className="commit-timeline">
                <h3>Commit Timeline</h3>
                <div className="timeline-item">
                  <div className="timeline-header">
                    <div className="timeline-title">2 min ago</div>
                    <div className="timeline-time">Workspace created</div>
                  </div>
                  <div className="timeline-duration">Duration: 1m 42s</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-header">
                    <div className="timeline-title">15 min ago</div>
                    <div className="timeline-time">UI refinement pass</div>
                  </div>
                  <div className="timeline-duration">Duration: 4m 11s</div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-header">
                    <div className="timeline-title">Yesterday</div>
                    <div className="timeline-time">Create screen redesign</div>
                  </div>
                  <div className="timeline-duration">Duration: 22m</div>
                </div>
              </div>
            </div>
          </aside>
        </section>
      );
    }

    return (
      <section className="workspace-grid">
        <aside className="preview-panel">
          <h2>Live Preview</h2>
          <div className="preview-placeholder">
            <div className="preview-icon">▭</div>
            <p>Your app preview will appear here.</p>
            <p className="preview-subtext">Run your project to preview changes.</p>
            
            <div className="device-toggle">
              <button className="device-btn active">
                <Monitor size={16} />
              </button>
              <button className="device-btn">
                <Smartphone size={16} />
              </button>
              <button className="device-btn">
                <Globe size={16} />
              </button>
            </div>
          </div>
        </aside>

        <section className="builder-panel">
          <div className="ai-builder-content">
            <div className="ai-builder-header">
              <h2>Build with Vivus</h2>
              <p>Describe what you want to build.</p>
            </div>
            
            <div className="ai-builder-input">
              <textarea placeholder="Describe what you want to build..." />
              <button type="button" className="send-button" onClick={() => action("AI build request")}>
                →
              </button>
            </div>
            
            <div className="ai-conversation">
              <div className="ai-message">
                <strong>Vivus</strong>
                <p>What would you like to build today?</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="plugins-panel">
          <h2>Project Activity</h2>
          <div className="plugins-content">
            <div className="pending-changes">
              <h3>Pending Changes</h3>
              <div className="change-item">
                <div className="change-description">UI improvements pending</div>
                <div className="change-meta">
                  <span className="duration">2m</span>
                  <span className="time">10:30 AM</span>
                </div>
              </div>
              <div className="change-item">
                <div className="change-description">Workspace initialization</div>
                <div className="change-meta">
                  <span className="duration">5m</span>
                  <span className="time">10:25 AM</span>
                </div>
              </div>
              <div className="change-item">
                <div className="change-description">Plugin sync pending</div>
                <div className="change-meta">
                  <span className="duration">10m</span>
                  <span className="time">10:20 AM</span>
                </div>
              </div>
            </div>
            
            <div className="commit-timeline">
              <h3>Commit Timeline</h3>
              <div className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title">2 min ago</div>
                  <div className="timeline-time">Workspace created</div>
                </div>
                <div className="timeline-duration">Duration: 1m 42s</div>
              </div>
              <div className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title">15 min ago</div>
                  <div className="timeline-time">UI refinement pass</div>
                </div>
                <div className="timeline-duration">Duration: 4m 11s</div>
              </div>
              <div className="timeline-item">
                <div className="timeline-header">
                  <div className="timeline-title">Yesterday</div>
                  <div className="timeline-time">Create screen redesign</div>
                </div>
                <div className="timeline-duration">Duration: 22m</div>
              </div>
            </div>
          </div>
        </aside>
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
              Untitled Project⌄
            </button>
          </div>

          <div className="workspace-actions">
            <button type="button" className="soft-button" onClick={() => navigate("create")}>
              Back to Create
            </button>
            <button type="button" className="soft-button" onClick={() => action("Share")}>
              <Share2 size={16} />
            </button>
            <button type="button" className="soft-button" onClick={() => action("Run")}>
              <Play size={16} />
            </button>
            <button type="button" className="soft-button" onClick={() => action("Settings")}>
              <Settings size={16} />
            </button>
          </div>
        </header>

        <nav className="workspace-tabs">
          {workspaceTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={workspaceTab === tab.key ? "workspace-tab active" : "workspace-tab"}
              onClick={() => switchWorkspaceTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {renderWorkspaceContent()}

        <div className="workspace-dock">
          {openPlugins.map((pluginId) => (
            <button
              key={pluginId}
              type="button"
              className={`dock-tab ${workspaceTab === pluginId ? "active" : ""}`}
              onClick={() => switchWorkspaceTab(pluginId as WorkspaceTab)}
            >
              {availablePlugins.find(p => p.id === pluginId)?.label}
              {openPlugins.length > 1 && (
                <button
                  type="button"
                  className="dock-tab-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    closePlugin(pluginId);
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </button>
          ))}
          
          <button
            type="button"
            className="dock-plugin-launcher"
            onClick={() => setShowPluginLauncher(!showPluginLauncher)}
          >
            <Plus size={16} />
          </button>
        </div>

        {showPluginLauncher && (
          <div className="plugin-launcher">
            <div className="plugin-launcher-header">
              <h3>Open Plugin</h3>
              <button
                type="button"
                className="plugin-launcher-close"
                onClick={() => setShowPluginLauncher(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="plugin-launcher-content">
              {availablePlugins.map((plugin) => (
                <button
                  key={plugin.id}
                  type="button"
                  className="plugin-launcher-item"
                  onClick={() => openPlugin(plugin.id as OpenPlugin)}
                >
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
