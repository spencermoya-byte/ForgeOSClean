import React from "react";

const App: React.FC = () => {
  // State management
  const [currentRoute, setCurrentRoute] = React.useState<string>('projects');
  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string>('');
  const menuRef = React.useRef<HTMLDivElement>(null);
  
  // Navigation items
  const navItems = [
    { route: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { route: 'projects', label: 'Projects', icon: '📁' },
    { route: 'ai', label: 'AI', icon: '🤖' },
    { route: 'marketplace', label: 'Marketplace', icon: '🏪' },
    { route: 'workspaces', label: 'Workspaces', icon: '💼' },
    { route: 'resources', label: 'Resources', icon: '📚' },
    { route: 'settings', label: 'Settings', icon: '⚙️' },
    { route: 'workspace', label: 'Workspace', icon: '💻' }, // Added workspace route
  ];
  
  // Normalize route names
  const normalizeRoute = (routeName: string): string => {
    if (routeName === '' || routeName === '/' || routeName === '#/' || routeName === '#') {
      return 'projects';
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
  
  // Get page title based on route
  const getPageTitle = (route: string) => {
    switch (route) {
      case 'projects': return 'Projects';
      case 'dashboard': return 'Dashboard';
      case 'ai': return 'AI';
      case 'marketplace': return 'Marketplace';
      case 'workspaces': return 'Workspaces';
      case 'resources': return 'Resources';
      case 'settings': return 'Settings';
      case 'workspace': return 'Workspace';
      default: return 'ForgeOS';
    }
  };
  
  // Handle click outside to close menu
  React.useEffect(() => {
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
  React.useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash.slice(1) || 'projects';
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
      case 'projects':
        return (
          <div className="projects-page">
            <div className="projects-header">
              <h1 className="projects-title">What do you want to build?</h1>
              <p className="projects-subtitle">Describe your idea and ForgeOS will help you create it</p>
            </div>
            
            <div className="projects-prompt">
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
                  <button className="control-button" onClick={() => placeholderAction("Attach Context")}>Attach Context</button>
                  <button className="control-button" onClick={() => placeholderAction("Select Model")}>Select Model</button>
                </div>
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
                setFeedbackMessage("Opened new workspace shell.");
                setTimeout(() => setFeedbackMessage(''), 3000);
                navigate('workspace');
              }}>
                New Project
              </button>
              <button className="project-button" onClick={() => {
                setFeedbackMessage("Opened placeholder existing workspace.");
                setTimeout(() => setFeedbackMessage(''), 3000);
                navigate('workspace');
              }}>
                Open Existing Project
              </button>
            </div>
          </div>
        );
        
      case 'workspace':
        return (
          <div className="workspace-shell">
            {/* Workspace Top Bar */}
            <div className="workspace-topbar">
              <h2 className="workspace-title">Workspace</h2>
              <button className="back-button" onClick={() => navigate('projects')}>Back to Projects</button>
            </div>
            
            {/* Workspace Content */}
            <div className="workspace-content">
              {/* File Explorer Panel */}
              <div className="workspace-panel file-explorer">
                <div className="panel-header">
                  <h3>Explorer</h3>
                </div>
                <div className="panel-content">
                  <p>Project files will appear here</p>
                </div>
              </div>
              
              {/* Editor Panel */}
              <div className="workspace-panel editor">
                <div className="panel-header">
                  <h3>Editor</h3>
                </div>
                <div className="panel-content">
                  <p>Editor shell — Monaco will be added later</p>
                </div>
              </div>
              
              {/* AI Assistant Panel */}
              <div className="workspace-panel ai-assistant">
                <div className="panel-header">
                  <h3>AI Assistant</h3>
                </div>
                <div className="panel-content">
                  <p>AI assistant shell — Ollama integration will be added later</p>
                </div>
              </div>
            </div>
            
            {/* Terminal Panel */}
            <div className="workspace-terminal">
              <div className="panel-header">
                <h3>Terminal</h3>
              </div>
              <div className="panel-content">
                <p>Terminal shell — command execution will be added later</p>
              </div>
            </div>
          </div>
        );
        
      case 'dashboard':
        return (
          <div className="page-content">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">Welcome to your ForgeOS dashboard. This is a placeholder page.</p>
            <p className="page-placeholder">Dashboard functionality will be restored soon.</p>
            <button className="back-button" onClick={() => navigate('projects')}>Back to Projects</button>
          </div>
        );
        
      case 'ai':
        return (
          <div className="page-content">
            <h1 className="page-title">AI</h1>
            <p className="page-description">AI capabilities for your projects.</p>
            <p className="page-placeholder">AI functionality will be restored soon.</p>
            <button className="back-button" onClick={() => navigate('projects')}>Back to Projects</button>
          </div>
        );
        
      case 'marketplace':
        return (
          <div className="page-content">
            <h1 className="page-title">Marketplace</h1>
            <p className="page-description">Browse extensions and tools for ForgeOS.</p>
            <p className="page-placeholder">Marketplace functionality will be restored soon.</p>
            <button className="back-button" onClick={() => navigate('projects')}>Back to Projects</button>
          </div>
        );
        
      case 'workspaces':
        return (
          <div className="page-content">
            <h1 className="page-title">Workspaces</h1>
            <p className="page-description">Manage your workspaces and projects.</p>
            <p className="page-placeholder">Workspaces functionality will be restored soon.</p>
            <button className="back-button" onClick={() => navigate('projects')}>Back to Projects</button>
          </div>
        );
        
      case 'resources':
        return (
          <div className="page-content">
            <h1 className="page-title">Resources</h1>
            <p className="page-description">Access documentation and resources.</p>
            <p className="page-placeholder">Resources functionality will be restored soon.</p>
            <button className="back-button" onClick={() => navigate('projects')}>Back to Projects</button>
          </div>
        );
        
      case 'settings':
        return (
          <div className="page-content">
            <h1 className="page-title">Settings</h1>
            <p className="page-description">Configure your ForgeOS environment.</p>
            <p className="page-placeholder">Settings functionality will be restored soon.</p>
            <button className="back-button" onClick={() => navigate('projects')}>Back to Projects</button>
          </div>
        );
        
      default:
        return (
          <div className="page-content">
            <h1 className="page-title">ForgeOS</h1>
            <p className="page-description">Welcome to ForgeOS</p>
            <button className="back-button" onClick={() => navigate('projects')}>Back to Projects</button>
          </div>
        );
    }
  };

  return (
    <div className="recovery-shell">
      {/* Header */}
      <header className="app-topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="hamburger-button"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={(event) => {
              event.stopPropagation();
              setIsMenuOpen((open) => !open);
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <span className="topbar-brand">ForgeOS</span>
        </div>

        <div className="topbar-center">
          {getPageTitle(currentRoute)}
        </div>

        <div className="topbar-right">
          <span className="status-dot"></span>
          <span>Frontend Active</span>
        </div>
      </header>
      
      {/* Hamburger dropdown menu */}
      {isMenuOpen && (
        <nav className="hamburger-dropdown" aria-label="Main navigation" ref={menuRef}>
          {navItems.map((item) => (
            <button
              key={item.route}
              type="button"
              className={
                currentRoute === item.route
                  ? "hamburger-menu-item active"
                  : "hamburger-menu-item"
              }
              onClick={() => navigate(item.route)}
            >
              <span className="hamburger-menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}
      
      {/* Main content */}
      <div className="main-container">
        {/* Left rail */}
        <div className="activity-rail">
          {navItems.map((item) => (
            <button
              key={item.route}
              className={`rail-button ${currentRoute === item.route ? 'active' : ''}`}
              title={item.label}
              onClick={() => navigate(item.route)}
              type="button"
            >
              <span className="rail-icon">{item.icon}</span>
            </button>
          ))}
        </div>
        
        {/* Workspace area */}
        <div className="workspace-area">
          <div className="workspace-header">
            <h2 className="workspace-title">{getPageTitle(currentRoute)}</h2>
          </div>
          
          <div className="workspace-content">
            {renderPage()}
          </div>
        </div>
        
        {/* Right status panel */}
        <div className="inspector-panel">
          <div className="panel-header">
            <h4 className="panel-title">ForgeOS Restoration Status</h4>
          </div>
          <div className="panel-content">
            <div className="panel-item">
              <span className="panel-label">Shell:</span>
              <span className="panel-value status-active">Active</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Routing:</span>
              <span className="panel-value status-active">Safe hash mode</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Projects:</span>
              <span className="panel-value status-placeholder">Placeholder actions</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Backend:</span>
              <span className="panel-value status-not-connected">Not connected</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Feature modules:</span>
              <span className="panel-value status-not-connected">Not connected</span>
            </div>
          </div>
        </div>
      </div>
      
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
