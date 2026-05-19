import React from "react";
import "./App.css";
import { LayoutGrid, Sparkles, UserRound, Share2, Play, Settings, Monitor, Smartphone, Globe, Plus, X, ChevronDown } from "lucide-react";

type Route = "create" | "apps" | "account" | "workspace";
type WorkspaceTab = "preview" | "builder" | "commits" | "plugins" | "console" | "publish";
type OpenPlugin = "preview" | "builder" | "commits" | "plugins" | "console" | "publish";

const quickStarts = ["Website", "Desktop App", "AI Tool", "Automation", "API", "Game", "Utility"];

const bottomNav: Array<{ route: Route; label: string; icon: React.ReactNode }> = [
  { route: "apps", label: "Apps", icon: <LayoutGrid size={20} strokeWidth={2} /> },
  { route: "create", label: "Create", icon: <Sparkles size={20} strokeWidth={2} /> },
  { route: "account", label: "Account", icon: <UserRound size={20} strokeWidth={2} /> },
];

const availablePlugins = [
  { id: "preview", label: "Live Preview" },
  { id: "builder", label: "Build" },
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

export default function App() {
  const [route, setRoute] = React.useState<Route>(() => normalizeRoute(window.location.hash || "create"));
  const [workspaceTab, setWorkspaceTab] = React.useState<WorkspaceTab>("builder");
  const [openPlugins, setOpenPlugins] = React.useState<OpenPlugin[]>(["preview", "builder", "commits"]);
  const [showPluginLauncher, setShowPluginLauncher] = React.useState(false);
  const [toast, setToast] = React.useState("");
  const [projectName, setProjectName] = React.useState("Untitled Project");
  
  // Build chat state
  const [buildInput, setBuildInput] = React.useState("");
  const [buildMessages, setBuildMessages] = React.useState<Array<{ role: string; content: string }>>([]);
  const [hasStartedConversation, setHasStartedConversation] = React.useState(false);
  const [currentMode, setCurrentMode] = React.useState<"plan" | "build">("build");
  const [planApproved, setPlanApproved] = React.useState(false);

  // Ref for auto-scrolling
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

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

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [buildMessages]);

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
    // Prevent closing default plugins
    if (["preview", "builder", "commits"].includes(pluginId)) {
      return;
    }
    
    if (openPlugins.length <= 1) return;
    
    const newPlugins = openPlugins.filter(id => id !== pluginId);
    setOpenPlugins(newPlugins);
    
    if (workspaceTab === pluginId) {
      // Switch to the first remaining plugin
      setWorkspaceTab(newPlugins[0] as WorkspaceTab);
    }
    
    action(`${pluginId} closed`);
  }

  function handleBuildSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!buildInput.trim()) {
      setToast("Please enter a description");
      return;
    }
    
    // Add user message
    const newMessages = [...buildMessages, {
      role: "user",
      content: buildInput
    }];
    
    // Add assistant response based on mode
    if (currentMode === "plan") {
      // In plan mode, respond with clarifying questions
      newMessages.push({
        role: "assistant",
        content: "I'll help you define the requirements. Can you tell me more about:\n\n1. What problem you're trying to solve?\n2. What features are essential?\n3. What platform will it target (web, desktop, mobile)?\n4. What UI style are you aiming for (modern, minimalist, etc.)?\n5. Are there any constraints or requirements to consider?"
      });
    } else {
      // In build mode, respond with build instructions
      // Check if the input is vague and add a clarifying question if needed
      const isVague = buildInput.length < 20;
      
      if (isVague) {
        newMessages.push({
          role: "assistant",
          content: "I'll use this as the starting build specification.\n\nUnderstood goal:\n[brief description of the request]\n\nInitial build scope:\n- Core screen/layout\n- Primary user interaction\n- Local-first data handling where applicable\n- Basic error/empty states\n\nReal local AI generation will be connected later.\n\nTo ensure I build the right thing, could you clarify what specific functionality you'd like to see first?"
        });
      } else {
        newMessages.push({
          role: "assistant",
          content: "I'll use this as the starting build specification.\n\nUnderstood goal:\n[brief description of the request]\n\nInitial build scope:\n- Core screen/layout\n- Primary user interaction\n- Local-first data handling where applicable\n- Basic error/empty states\n\nReal local AI generation will be connected later."
        });
      }
    }
    
    setBuildMessages(newMessages);
    setBuildInput("");
    setHasStartedConversation(true);
  }

  function handleApprovePlan() {
    // Switch to build mode
    setCurrentMode("build");
    
    // Add assistant message about approved plan
    const newMessages = [...buildMessages];
    newMessages.push({
      role: "assistant",
      content: "Plan approved. I'll now use this as the build specification."
    });
    
    setBuildMessages(newMessages);
    setPlanApproved(true);
  }

  function handleModeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const mode = e.target.value as "plan" | "build";
    setCurrentMode(mode);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBuildSubmit(e as any);
    }
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
    // Only render content for the active workspace tab
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
        </section>
      );
    }

    if (workspaceTab === "builder") {
      return (
        <section className="workspace-grid">
          <section className="builder-panel">
            {hasStartedConversation ? (
              <div className="ai-builder-content">
                <div className="ai-conversation">
                  {buildMessages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`ai-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                    >
                      <strong>{message.role === 'user' ? 'You' : 'Vivus'}</strong>
                      <p>{message.content}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="ai-builder-input-wrapper">
                  <form onSubmit={handleBuildSubmit} className="ai-builder-input-form">
                    <textarea 
                      placeholder={currentMode === "plan" 
                        ? "Describe your requirements and goals..." 
                        : "Make, test, iterate..."}
                      value={buildInput}
                      onChange={(e) => setBuildInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      type="button"
                      className="composer-plus ai-builder-plus"
                      aria-label="Add context"
                      onClick={() => action("Add context")}
                    >
                      +
                    </button>
                    <div className="composer-controls">
                      <select 
                        className="mode-selector"
                        value={currentMode}
                        onChange={handleModeChange}
                      >
                        <option value="build">Build</option>
                        <option value="plan">Plan</option>
                      </select>
                      <button type="submit" className="send-button">
                        →
                      </button>
                    </div>
                  </form>
                </div>
                
                {currentMode === "plan" && buildMessages.length > 1 && !planApproved && (
                  <div className="plan-approval-container">
                    <button 
                      type="button" 
                      className="soft-button"
                      onClick={handleApprovePlan}
                    >
                      Approve Plan
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ai-builder-content">
                <div className="ai-builder-header">
                  <h2>Build with Vivus</h2>
                  <p>Describe what you want to build.</p>
                </div>
                
                <div className="ai-builder-input-wrapper">
                  <form onSubmit={handleBuildSubmit} className="ai-builder-input-form">
                    <textarea 
                      placeholder={currentMode === "plan" 
                        ? "Describe your requirements and goals..." 
                        : "Make, test, iterate..."}
                      value={buildInput}
                      onChange={(e) => setBuildInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      type="button"
                      className="composer-plus ai-builder-plus"
                      aria-label="Add context"
                      onClick={() => action("Add context")}
                    >
                      +
                    </button>
                    <div className="composer-controls">
                      <select 
                        className="mode-selector"
                        value={currentMode}
                        onChange={handleModeChange}
                      >
                        <option value="build">Build</option>
                        <option value="plan">Plan</option>
                      </select>
                      <button type="submit" className="send-button">
                        →
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="ai-conversation">
                  <div className="ai-message assistant-message">
                    <strong>Vivus</strong>
                    <p>Hey there! What would you like to build today?</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </section>
      );
    }

    if (workspaceTab === "commits") {
      return (
        <section className="workspace-grid">
          <aside className="plugins-panel">
            <h2>Commits</h2>
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
          <section className="builder-panel">
            <h2>Plugins</h2>
            <div className="plugins-content">
              <p>Plugin manager placeholder</p>
            </div>
          </section>
        </section>
      );
    }

    if (workspaceTab === "console") {
      return (
        <section className="workspace-grid">
          <section className="builder-panel">
            <h2>Console</h2>
            <div className="plugins-content">
              <p>Console placeholder</p>
            </div>
          </section>
        </section>
      );
    }

    if (workspaceTab === "publish") {
      return (
        <section className="workspace-grid">
          <section className="builder-panel">
            <h2>Publish</h2>
            <div className="plugins-content">
              <p>Publish placeholder</p>
            </div>
          </section>
        </section>
      );
    }

    // Default fallback
    return (
      <section className="workspace-grid">
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
      </section>
    );
  }

  function renderWorkspace() {
    return (
      <main className="workspace-screen">
        <header className="workspace-topbar">
          <div className="workspace-brand">
            <div className="logo-box">V</div>
            <button 
              type="button" 
              className="project-name" 
              onClick={() => action("Project menu")}
            >
              {projectName} <ChevronDown size={16} />
            </button>
          </div>

          <div className="workspace-actions">
            <button type="button" className="soft-button" onClick={() => navigate("create")}>
              Home
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
              {openPlugins.length > 1 && !["preview", "builder", "commits"].includes(pluginId) && (
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
          <div className="dock-divider" aria-hidden="true" />
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
              <h3>Open Tool</h3>
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
          {bottomNav.map((item, index) => (
            <React.Fragment key={item.route}>
              <button
                className={route === item.route ? "bottom-nav-item active" : "bottom-nav-item"}
                onClick={() => navigate(item.route)}
              >
                <span>{item.icon}</span>
                <strong>{item.label}</strong>
              </button>
              {index < bottomNav.length - 1 && (
                <div className="nav-divider" />
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
