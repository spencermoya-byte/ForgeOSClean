import React, { useState, useEffect } from "react";

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('create');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Navigation items
  const navItems = [
    { route: 'create', label: 'Create', icon: '➕' },
    { route: 'apps', label: 'Apps', icon: '📁' },
    { route: 'account', label: 'Account', icon: '👤' },
  ];

  // Normalize route names
  const normalizeRoute = (routeName: string): string => {
    if (routeName === '' || routeName === '/' || routeName === '#/' || routeName === '#') {
      return 'create';
    }
    return routeName;
  };

  // Centralized navigation function
  const navigate = (routeName: string) => {
    const normalizedRoute = normalizeRoute(routeName);
    setCurrentRoute(normalizedRoute);
    window.location.hash = `/${normalizedRoute}`;
    setIsMenuOpen(false);
  };

  // Show placeholder feedback
  const placeholderAction = (label: string) => {
    setFeedbackMessage(`Placeholder action: ${label} is not connected yet.`);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  // Handle click outside to close menu
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash.slice(1) || 'create';
      const normalizedRoute = normalizeRoute(hash);
      setCurrentRoute(normalizedRoute);
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Render page content based on route
  const renderPage = () => {
    switch (currentRoute) {
      case 'create':
        return (
          <div className="create-page">
            <div className="workspace-pill">ForgeOS local workspace</div>
            
            <div className="create-header">
              <h1 className="create-title">What do you want to build?</h1>
              <p className="create-subtitle">Describe your idea and ForgeOS will help you create it</p>
            </div>
            
            <div className="prompt-container">
              <textarea 
                className="prompt-textarea"
                placeholder="Describe what you want ForgeOS to build..."
                rows={3}
              ></textarea>
              <button className="prompt-plus-button" onClick={() => placeholderAction("Attach files/photos")}>
                <span className="plus-icon">+</span>
              </button>
              <div className="prompt-controls">
                <button className="control-button" onClick={() => placeholderAction("Plan")}>Plan</button>
                <button className="control-button" onClick={() => {
                  placeholderAction("Send to workspace");
                  navigate("workspace");
                }}>Send</button>
              </div>
            </div>
            
            <div className="quick-start">
              <h2 className="section-title">Quick Start</h2>
              <div className="quick-start-pills">
                <button className="pill-button" onClick={() => placeholderAction("Website project")}>Website</button>
                <button className="pill-button" onClick={() => placeholderAction("Desktop App project")}>Desktop App</button>
                <button className="pill-button" onClick={() => placeholderAction("AI Tool project")}>AI Tool</button>
                <button className="pill-button" onClick={() => placeholderAction("Automation project")}>Automation</button>
                <button className="pill-button" onClick={() => placeholderAction("API project")}>API</button>
                <button className="pill-button" onClick={() => placeholderAction("Game project")}>Game</button>
                <button className="pill-button" onClick={() => placeholderAction("Utility project")}>Utility</button>
              </div>
            </div>
            
            <div className="recent-projects">
              <h2 className="section-title">Recent Projects</h2>
              <div className="projects-placeholder">
                <p>No recent projects found</p>
              </div>
            </div>
            
            <div className="project-actions">
              <button className="project-button" onClick={() => {
                placeholderAction("Opened new workspace shell.");
                navigate("workspace");
              }}>
                New Project
              </button>
            </div>
          </div>
        );
        
      case 'apps':
        return (
          <div className="apps-page">
            <div className="apps-header">
              <h1 className="apps-title">Apps</h1>
            </div>
            
            <div className="apps-content">
              <div className="apps-row">
                <h2 className="apps-row-title">All Apps</h2>
              </div>
              
              <div className="apps-grid">
                <div className="app-card">
                  <div className="app-card-header">
                    <div className="app-icon">🚀</div>
                    <div className="app-card-title">My Project</div>
                  </div>
                  <div className="app-card-footer">
                    <span className="app-card-date">2023-05-15</span>
                  </div>
                </div>
                
                <div className="app-card">
                  <div className="app-card-header">
                    <div className="app-icon">🤖</div>
                    <div className="app-card-title">AI Assistant</div>
                  </div>
                  <div className="app-card-footer">
                    <span className="app-card-date">2023-05-10</span>
                  </div>
                </div>
                
                <div className="app-card">
                  <div className="app-card-header">
                    <div className="app-icon">🌐</div>
                    <div className="app-card-title">Web App</div>
                  </div>
                  <div className="app-card-footer">
                    <span className="app-card-date">2023-05-05</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'account':
        return (
          <div className="account-page">
            <div className="account-header">
              <div className="avatar-container">
                <div className="avatar">JD</div>
              </div>
              <div className="user-info">
                <h2 className="user-name">John Doe</h2>
                <p className="user-handle">@johndoe</p>
              </div>
            </div>
            
            <div className="settings-section">
              <h3 className="section-title">Settings</h3>
              <div className="settings-list">
                <button className="setting-item" onClick={() => placeholderAction("Profile settings")}>
                  <span className="setting-label">Profile</span>
                  <span className="setting-arrow">→</span>
                </button>
                <button className="setting-item" onClick={() => placeholderAction("Theme settings")}>
                  <span className="setting-label">Theme</span>
                  <span className="setting-arrow">→</span>
                </button>
                <button className="setting-item" onClick={() => placeholderAction("Usage settings")}>
                  <span className="setting-label">Usage</span>
                  <span className="setting-arrow">→</span>
                </button>
                <button className="setting-item" onClick={() => placeholderAction("Notifications settings")}>
                  <span className="setting-label">Notifications</span>
                  <span className="setting-arrow">→</span>
                </button>
                <button className="setting-item" onClick={() => placeholderAction("Help settings")}>
                  <span className="setting-label">Help</span>
                  <span className="setting-arrow">→</span>
                </button>
              </div>
            </div>
            
            <div className="account-footer">
              <button className="logout-button" onClick={() => placeholderAction("Logout")}>Logout</button>
            </div>
          </div>
        );
        
      case 'workspace':
        return (
          <div className="workspace-shell">
            {/* Workspace Top Bar */}
            <div className="workspace-topbar">
              <div className="topbar-left">
                <span className="project-name">My Project</span>
                <button className="upgrade-button" onClick={() => placeholderAction("Upgrade")}>Upgrade</button>
              </div>
              
              <div className="topbar-tabs">
                <button className="tab-button active" onClick={() => placeholderAction("Agent tab")}>Agent</button>
                <button className="tab-button" onClick={() => placeholderAction("Preview tab")}>Preview</button>
                <button className="tab-button" onClick={() => placeholderAction("Console tab")}>Console</button>
                <button className="tab-button" onClick={() => placeholderAction("Git tab")}>Git</button>
                <button className="tab-button" onClick={() => placeholderAction("Diff/Settings tab")}>Diff</button>
              </div>
              
              <div className="topbar-right">
                <button className="invite-button" onClick={() => placeholderAction("Invite")}>Invite</button>
                <button className="publish-button" onClick={() => placeholderAction("Publish")}>Publish</button>
              </div>
            </div>
            
            {/* Main workspace content */}
            <div className="workspace-content">
              {/* Left AI Agent Panel */}
              <div className="agent-panel">
                <div className="agent-header">
                  <h3>ForgeOS AI Agent</h3>
                </div>
                
                <div className="agent-task">
                  <div className="task-title">Planning project structure</div>
                  <div className="task-progress">
                    <div className="progress-bar" style={{ width: '40%' }}></div>
                  </div>
                </div>
                
                <div className="agent-progress">
                  <div className="progress-step">
                    <span className="step-status">✓</span>
                    <span className="step-text">Project structure planned</span>
                  </div>
                  <div className="progress-step">
                    <span className="step-status">✓</span>
                    <span className="step-text">Editor shell prepared</span>
                  </div>
                  <div className="progress-step">
                    <span className="step-status">○</span>
                    <span className="step-text">Waiting for model integration</span>
                  </div>
                </div>
                
                <div className="agent-input-area">
                  <button className="input-plus-button" onClick={() => placeholderAction("Add file")}>
                    <span className="plus-icon">+</span>
                  </button>
                  <input 
                    type="text" 
                    className="agent-input" 
                    placeholder="What would you like to do next?"
                  />
                  <button className="plan-button" onClick={() => placeholderAction("Plan")}>Plan</button>
                  <button className="send-button" onClick={() => placeholderAction("Send")}>Send</button>
                </div>
              </div>
              
              {/* Center Editor Panel */}
              <div className="editor-panel">
                <div className="editor-header">
                  <span className="file-path">client/src/App.tsx</span>
                </div>
                <div className="editor-content">
                  <div className="line-numbers">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                    <span>6</span>
                    <span>7</span>
                    <span>8</span>
                    <span>9</span>
                    <span>10</span>
                  </div>
                  <div className="editor-text">
                    <pre className="editor-code">
{`import React from "react";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="workspace-shell">
      <h1>ForgeOS Workspace</h1>
    </div>
  );
};

export default App;`}
</pre>
                  </div>
                </div>
              </div>
              
              {/* Right Tab Panel */}
              <div className="tab-panel">
                <div className="tab-header">
                  <button className="tab-button active" onClick={() => placeholderAction("Preview tab")}>Preview</button>
                  <button className="tab-button" onClick={() => placeholderAction("Console tab")}>Console</button>
                  <button className="tab-button" onClick={() => placeholderAction("Git tab")}>Git</button>
                  <button className="tab-button" onClick={() => placeholderAction("Diff tab")}>Diff</button>
                </div>
                <div className="tab-content">
                  <div className="tab-placeholder">
                    <p>Tab content placeholder</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Status Bar */}
            <div className="workspace-statusbar">
              <div className="status-item">
                <span className="status-dot"></span>
                <span>Workspace shell active</span>
              </div>
              <div className="status-item">
                <span className="status-dot"></span>
                <span>Editor placeholder</span>
              </div>
              <div className="status-item">
                <span className="status-dot"></span>
                <span>AI placeholder</span>
              </div>
              <div className="status-item">
                <span className="status-dot status-not-connected"></span>
                <span>Backend not connected</span>
              </div>
            </div>
            
            <button className="back-button" onClick={() => navigate('create')}>
              Back to Create
            </button>
          </div>
        );
        
      default:
        return (
          <div className="create-page">
            <div className="workspace-pill">ForgeOS local workspace</div>
            
            <div className="create-header">
              <h1 className="create-title">What do you want to build?</h1>
              <p className="create-subtitle">Describe your idea and ForgeOS will help you create it</p>
            </div>
            
            <div className="prompt-container">
              <textarea 
                className="prompt-textarea"
                placeholder="Describe what you want ForgeOS to build..."
                rows={3}
              ></textarea>
              <button className="prompt-plus-button" onClick={() => placeholderAction("Attach files/photos")}>
                <span className="plus-icon">+</span>
              </button>
              <div className="prompt-controls">
                <button className="control-button" onClick={() => placeholderAction("Plan")}>Plan</button>
                <button className="control-button" onClick={() => {
                  placeholderAction("Send to workspace");
                  navigate("workspace");
                }}>Send</button>
              </div>
            </div>
            
            <div className="quick-start">
              <h2 className="section-title">Quick Start</h2>
              <div className="quick-start-pills">
                <button className="pill-button" onClick={() => placeholderAction("Website project")}>Website</button>
                <button className="pill-button" onClick={() => placeholderAction("Desktop App project")}>Desktop App</button>
                <button className="pill-button" onClick={() => placeholderAction("AI Tool project")}>AI Tool</button>
                <button className="pill-button" onClick={() => placeholderAction("Automation project")}>Automation</button>
                <button className="pill-button" onClick={() => placeholderAction("API project")}>API</button>
                <button className="pill-button" onClick={() => placeholderAction("Game project")}>Game</button>
                <button className="pill-button" onClick={() => placeholderAction("Utility project")}>Utility</button>
              </div>
            </div>
            
            <div className="recent-projects">
              <h2 className="section-title">Recent Projects</h2>
              <div className="projects-placeholder">
                <p>No recent projects found</p>
              </div>
            </div>
            
            <div className="project-actions">
              <button className="project-button" onClick={() => {
                placeholderAction("Opened new workspace shell.");
                navigate("workspace");
              }}>
                New Project
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Main content */}
      <div className="main-content">
        {renderPage()}
      </div>
      
      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.route}
            className={`nav-button ${currentRoute === item.route ? 'active' : ''}`}
            onClick={() => navigate(item.route)}
            type="button"
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Feedback toast */}
      {feedbackMessage && (
        <div className="feedback-toast">
          {feedbackMessage}
        </div>
      )}
    </div>
  );
};

export default App;
