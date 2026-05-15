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
          <button className="rail-button active" title="Dashboard">
            <span className="rail-icon">🏠</span>
          </button>
          <button className="rail-button" title="Projects">
            <span className="rail-icon">📁</span>
          </button>
          <button className="rail-button" title="AI">
            <span className="rail-icon">🤖</span>
          </button>
          <button className="rail-button" title="Marketplace">
            <span className="rail-icon">🏪</span>
          </button>
          <button className="rail-button" title="Workspaces">
            <span className="rail-icon">💼</span>
          </button>
          <button className="rail-button" title="Resources">
            <span className="rail-icon">📚</span>
          </button>
          <button className="rail-button" title="Settings">
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
            <h4 className="panel-title">ForgeOS Status</h4>
          </div>
          <div className="panel-content">
            <div className="panel-item">
              <span className="panel-label">Version:</span>
              <span className="panel-value">v1.2.3</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">AI Status:</span>
              <span className="panel-value">Active</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Workspace:</span>
              <span className="panel-value">Default</span>
            </div>
            <div className="panel-item">
              <span className="panel-label">Restoration:</span>
              <span className="panel-value">85% complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Simple hash-based routing
  const [currentRoute, setCurrentRoute] = React.useState<string>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash.slice(1) || 'dashboard';
      
      // Normalize empty or root hashes to dashboard
      if (hash === '' || hash === '/' || hash === '#/' || hash === '#') {
        hash = 'dashboard';
        window.location.hash = '#/dashboard';
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
      case 'projects':
        return (
          <div className="recovery-page">
            <h1 className="recovery-page-title">Projects</h1>
            <p className="recovery-page-text mb-4">Placeholder page — system restoration in progress</p>
            <p className="recovery-page-text mb-6">This section will display project management functionality once restored.</p>
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
              className={`menu-item ${currentRoute === 'projects' ? 'active' : ''}`}
              onClick={() => handleNavigation('projects')}
            >
              Projects
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
