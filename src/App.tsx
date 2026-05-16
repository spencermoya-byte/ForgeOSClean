import React from "react";

// Safe recovery shell component
const RecoveryShell = () => {
  return (
    <div className="recovery-shell">
      <div className="top-bar">
        <div className="top-bar-left">
          <button 
            className="hamburger-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <h1 className="brand-title">ForgeOS</h1>
        </div>
        <div className="top-bar-center">
          <h2 className="page-title">Dashboard</h2>
        </div>
        <div className="top-bar-right">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span className="status-text">Online</span>
          </div>
        </div>
      </div>
      
      <div className="main-container">
        <div className="activity-rail">
          <button 
            className="rail-button active" 
            title="Dashboard"
            onClick={() => handleNavigation('dashboard')}
          >
            <span className="rail-icon">🏠</span>
          </button>
          <button 
            className="rail-button" 
            title="Projects"
            onClick={() => handleNavigation('projects')}
          >
            <span className="rail-icon">📁</span>
          </button>
          <button 
            className="rail-button" 
            title="AI"
            onClick={() => handleNavigation('ai')}
          >
            <span className="rail-icon">🤖</span>
          </button>
          <button 
            className="rail-button" 
            title="Marketplace"
            onClick={() => handleNavigation('marketplace')}
          >
            <span className="rail-icon">🏪</span>
          </button>
          <button 
            className="rail-button" 
            title="Workspaces"
            onClick={() => handleNavigation('workspaces')}
          >
            <span className="rail-icon">💼</span>
          </button>
          <button 
            className="rail-button" 
            title="Resources"
            onClick={() => handleNavigation('resources')}
          >
            <span className="rail-icon">📚</span>
          </button>
          <button 
            className="rail-button" 
            title="Settings"
            onClick={() => handleNavigation('settings')}
          >
            <span className="rail-icon">⚙️</span>
          </button>
        </div>
        
        <div className="workspace-area">
          <div className="workspace-header">
            <h3 className="workspace-title">Current Workspace</h3>
          </div>
          
          <div className="workspace-content">
            <div className="card-grid">
              <div className="card">
                <h4 className="card-title">AI Status</h4>
                <p className="card-text">AI assistant is ready</p>
                <div className="card-status">
                  <span className="status-indicator online"></span>
                  <span className="status-text">Online</span>
                </div>
              </div>
              
              <div className="card">
                <h4 className="card-title">Projects</h4>
                <p className="card-text">3 active projects</p>
                <div className="card-actions">
                  <button className="card-button">View All</button>
                </div>
              </div>
              
              <div className="card">
                <h4 className="card-title">Extensions</h4>
                <p className="card-text">5 installed extensions</p>
                <div className="card-actions">
                  <button className="card-button">Browse</button>
                </div>
              </div>
              
              <div className="card">
                <h4 className="card-title">System Health</h4>
                <p className="card-text">All systems operational</p>
                <div className="card-status">
                  <span className="status-indicator online"></span>
                  <span className="status-text">Healthy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="inspector-panel">
          <div className="panel-header">
            <h4 className="panel-title">ForgeOS Restoration Status</h4>
          </div>
          <div className="panel-content">
            <div className="panel-item">
              <span className="panel-label">Shell Renders:</span>
              <span className="panel-value status-ready">Ready</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Safe Routing:</span>
              <span className="panel-value status-active">Active</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Projects Home:</span>
              <span className="panel-value status-placeholder">Placeholder</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Hamburger Menu:</span>
              <span className="panel-value status-active">Active</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Left Rail Nav:</span>
              <span className="panel-value status-active">Active</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Project Persistence:</span>
              <span className="panel-value status-deferred">Deferred</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Backend Connection:</span>
              <span className="panel-value status-not-connected">Not connected</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Feature Modules:</span>
              <span className="panel-value status-not-connected">Not connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Projects Home Screen Component - Redesigned
const ProjectsHome = () => {
  return (
    <div className="recovery-shell">
      <div className="top-bar">
        <div className="top-bar-left">
          <button 
            className="hamburger-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <h1 className="brand-title">ForgeOS</h1>
        </div>
        <div className="top-bar-center">
          <h2 className="page-title">Projects</h2>
        </div>
        <div className="top-bar-right">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span className="status-text">Online</span>
          </div>
        </div>
      </div>
      
      <div className="main-container">
        <div className="activity-rail">
          <button 
            className="rail-button" 
            title="Dashboard"
            onClick={() => handleNavigation('dashboard')}
          >
            <span className="rail-icon">🏠</span>
          </button>
          <button 
            className="rail-button active" 
            title="Projects"
            onClick={() => handleNavigation('projects')}
          >
            <span className="rail-icon">📁</span>
          </button>
          <button 
            className="rail-button" 
            title="AI"
            onClick={() => handleNavigation('ai')}
          >
            <span className="rail-icon">🤖</span>
          </button>
          <button 
            className="rail-button" 
            title="Marketplace"
            onClick={() => handleNavigation('marketplace')}
          >
            <span className="rail-icon">🏪</span>
          </button>
          <button 
            className="rail-button" 
            title="Workspaces"
            onClick={() => handleNavigation('workspaces')}
          >
            <span className="rail-icon">💼</span>
          </button>
          <button 
            className="rail-button" 
            title="Resources"
            onClick={() => handleNavigation('resources')}
          >
            <span className="rail-icon">📚</span>
          </button>
          <button 
            className="rail-button" 
            title="Settings"
            onClick={() => handleNavigation('settings')}
          >
            <span className="rail-icon">⚙️</span>
          </button>
        </div>
        
        <div className="workspace-area">
          <div className="workspace-header">
            <h3 className="workspace-title">Projects</h3>
          </div>
          
          <div className="workspace-content">
            <div className="projects-home-container">
              {/* Greeting and Creation Prompt */}
              <div className="creation-prompt">
                <h1 className="creation-title">What do you want to build?</h1>
                <p className="creation-subtitle">Describe your idea and ForgeOS will help you create it</p>
                
                <div className="creation-input-container">
                  <textarea 
                    className="creation-input"
                    placeholder="Describe what you want ForgeOS to build..."
                    rows={3}
                  ></textarea>
                  <div className="creation-controls">
                    <button className="control-button">Plan</button>
                    <button className="control-button">Attach Context</button>
                    <button className="control-button">Select Model</button>
                  </div>
                </div>
              </div>
              
              {/* Quick Start Categories */}
              <div className="quick-start-section">
                <h3 className="section-title">Quick Start</h3>
                <div className="quick-start-buttons">
                  <button className="quick-start-button">Desktop App</button>
                  <button className="quick-start-button">Website</button>
                  <button className="quick-start-button">AI Tool</button>
                  <button className="quick-start-button">Automation</button>
                  <button className="quick-start-button">API</button>
                  <button className="quick-start-button">CAD Tool</button>
                  <button className="quick-start-button">Game</button>
                  <button className="quick-start-button">Utility</button>
                </div>
              </div>
              
              {/* Project Actions */}
              <div className="project-actions">
                <button className="action-button primary">New Project</button>
                <button className="action-button secondary">Open Existing Project</button>
                <button className="action-button secondary">Import Project</button>
              </div>
              
              {/* Recent Projects */}
              <div className="recent-projects-section">
                <h3 className="section-title">Recent Projects</h3>
                <div className="projects-grid">
                  <div className="project-card placeholder">
                    <div className="project-card-content">
                      <div className="project-icon">📁</div>
                      <h4 className="project-card-title">Project Placeholder</h4>
                      <p className="project-card-description">This is a placeholder for a real project</p>
                      <div className="project-card-footer">
                        <span className="project-card-date">Last opened: Today</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="project-card placeholder">
                    <div className="project-card-content">
                      <div className="project-icon">📁</div>
                      <h4 className="project-card-title">Another Placeholder</h4>
                      <p className="project-card-description">Example project for demonstration</p>
                      <div className="project-card-footer">
                        <span className="project-card-date">Last opened: Yesterday</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="project-card placeholder">
                    <div className="project-card-content">
                      <div className="project-icon">📁</div>
                      <h4 className="project-card-title">Sample Project</h4>
                      <p className="project-card-description">This project is a template</p>
                      <div className="project-card-footer">
                        <span className="project-card-date">Last opened: 2 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="inspector-panel">
          <div className="panel-header">
            <h4 className="panel-title">ForgeOS Restoration Status</h4>
          </div>
          <div className="panel-content">
            <div className="panel-item">
              <span className="panel-label">Shell Renders:</span>
              <span className="panel-value status-ready">Ready</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Safe Routing:</span>
              <span className="panel-value status-active">Active</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Projects Home:</span>
              <span className="panel-value status-placeholder">Placeholder</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Hamburger Menu:</span>
              <span className="panel-value status-active">Active</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Left Rail Nav:</span>
              <span className="panel-value status-active">Active</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Project Persistence:</span>
              <span className="panel-value status-deferred">Deferred</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Backend Connection:</span>
              <span className="panel-value status-not-connected">Not connected</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Feature Modules:</span>
              <span className="panel-value status-not-connected">Not connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Simple hash-based routing
  const [currentRoute, setCurrentRoute] = React.useState<string>('projects');
  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash.slice(1) || 'projects';
      
      // Normalize empty or root hashes to projects
      if (hash === '' || hash === '/' || hash === '#/' || hash === '#') {
        hash = 'projects';
        window.location.hash = '#/projects';
      }
      
      setCurrentRoute(hash);
    };
    
    // Initialize on load
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Handle navigation
  const handleNavigation = (route: string) => {
    window.location.hash = `#/${route}`;
    setIsMenuOpen(false);
  };
  
  // Route components
  const renderRoute = () => {
    switch (currentRoute) {
      case 'projects':
        return <ProjectsHome />;
      case 'dashboard':
        return <RecoveryShell />;
      case 'marketplace':
        return (
          <div className="recovery-page">
            <h1 className="recovery-page-title">Marketplace</h1>
            <p className="recovery-page-text mb-4">Placeholder page — system restoration in progress</p>
            <p className="recovery-page-text mb-6">This section will display the marketplace functionality once restored.</p>
            <button 
              onClick={() => handleNavigation('dashboard')}
              className="recovery-button"
            >
              Back to Dashboard
            </button>
          </div>
        );
      case 'ai':
        return (
          <div className="recovery-page">
            <h1 className="recovery-page-title">AI</h1>
            <p className="recovery-page-text mb-4">Placeholder page — system restoration in progress</p>
            <p className="recovery-page-text mb-6">This section will display AI functionality once restored.</p>
            <button 
              onClick={() => handleNavigation('dashboard')}
              className="recovery-button"
            >
              Back to Dashboard
            </button>
          </div>
        );
      case 'workspaces':
        return (
          <div className="recovery-page">
            <h1 className="recovery-page-title">Workspaces</h1>
            <p className="recovery-page-text mb-4">Placeholder page — system restoration in progress</p>
            <p className="recovery-page-text mb-6">This section will display workspace management functionality once restored.</p>
            <button 
              onClick={() => handleNavigation('dashboard')}
              className="recovery-button"
            >
              Back to Dashboard
            </button>
          </div>
        );
      case 'resources':
        return (
          <div className="recovery-page">
            <h1 className="recovery-page-title">Resources</h1>
            <p className="recovery-page-text mb-4">Placeholder page — system restoration in progress</p>
            <p className="recovery-page-text mb-6">This section will display resource management functionality once restored.</p>
            <button 
              onClick={() => handleNavigation('dashboard')}
              className="recovery-button"
            >
              Back to Dashboard
            </button>
          </div>
        );
      case 'settings':
        return (
          <div className="recovery-page">
            <h1 className="recovery-page-title">Settings</h1>
            <p className="recovery-page-text mb-4">Placeholder page — system restoration in progress</p>
            <p className="recovery-page-text mb-6">This section will display application settings once restored.</p>
            <button 
              onClick={() => handleNavigation('dashboard')}
              className="recovery-button"
            >
              Back to Dashboard
            </button>
          </div>
        );
      default:
        return (
          <div className="recovery-page">
            <h1 className="recovery-page-title">Page Not Found</h1>
            <p className="recovery-page-text mb-4">The page you are looking for does not exist.</p>
            <button 
              onClick={() => handleNavigation('dashboard')}
              className="recovery-button"
            >
              Back to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="recovery-shell">
      {/* Hamburger Menu */}
      <div className="hamburger-menu">
        <button 
          className="hamburger-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        
        {isMenuOpen && (
          <div className="menu-dropdown">
            <button 
              className={`menu-item ${currentRoute === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigation('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`menu-item ${currentRoute === 'projects' ? 'active' : ''}`}
              onClick={() => handleNavigation('projects')}
            >
              Projects
            </button>
            <button 
              className={`menu-item ${currentRoute === 'marketplace' ? 'active' : ''}`}
              onClick={() => handleNavigation('marketplace')}
            >
              Marketplace
            </button>
            <button 
              className={`menu-item ${currentRoute === 'ai' ? 'active' : ''}`}
              onClick={() => handleNavigation('ai')}
            >
              AI
            </button>
            <button 
              className={`menu-item ${currentRoute === 'workspaces' ? 'active' : ''}`}
              onClick={() => handleNavigation('workspaces')}
            >
              Workspaces
            </button>
            <button 
              className={`menu-item ${currentRoute === 'resources' ? 'active' : ''}`}
              onClick={() => handleNavigation('resources')}
            >
              Resources
            </button>
            <button 
              className={`menu-item ${currentRoute === 'settings' ? 'active' : ''}`}
              onClick={() => handleNavigation('settings')}
            >
              Settings
            </button>
          </div>
        )}
      </div>
      
      {renderRoute()}
    </div>
  );
};

export default App;
