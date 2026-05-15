import React from "react";

// Safe recovery shell component
const RecoveryShell = () => {
  return (
    <div className="recovery-shell">
      <header className="recovery-header">
        <h1 className="text-3xl font-bold text-center">ForgeOS Recovery Shell TEST</h1>
        <p className="text-green-400 text-center mt-2">React is rendering successfully</p>
      </header>
      
      <main className="recovery-main">
        <div className="recovery-nav-card">
          <h2 className="text-xl font-bold mb-4">Navigation</h2>
          <p className="text-gray-300 mb-4">This is a recovery shell showing that the frontend is working.</p>
          <div className="nav-row">
            <a href="#/dashboard" className="nav-button">
              Dashboard
            </a>
            <a href="#/marketplace" className="nav-button">
              Marketplace
            </a>
            <a href="#/ai" className="nav-button">
              AI
            </a>
            <a href="#/projects" className="nav-button">
              Projects
            </a>
            <a href="#/workspaces" className="nav-button">
              Workspaces
            </a>
            <a href="#/resources" className="nav-button">
              Resources
            </a>
            <a href="#/settings" className="nav-button">
              Settings
            </a>
          </div>
        </div>
        
        <div className="recovery-status-card">
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="recovery-status-item">
              <div className="recovery-status-indicator"></div>
              <span className="recovery-status-text">Frontend is running</span>
            </div>
            <div className="recovery-status-item">
              <div className="recovery-status-indicator"></div>
              <span className="recovery-status-text">React is rendering</span>
            </div>
            <div className="recovery-status-item">
              <div className="recovery-status-indicator"></div>
              <span className="recovery-status-text">Features are being restored</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  // Simple hash-based routing
  const [currentRoute, setCurrentRoute] = React.useState<string>('dashboard');
  
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
              onClick={() => window.location.hash = '#/dashboard'}
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
              onClick={() => window.location.hash = '#/dashboard'}
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
              onClick={() => window.location.hash = '#/dashboard'}
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
              onClick={() => window.location.hash = '#/dashboard'}
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
              onClick={() => window.location.hash = '#/dashboard'}
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
              onClick={() => window.location.hash = '#/dashboard'}
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
              onClick={() => window.location.hash = '#/dashboard'}
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
      {renderRoute()}
    </div>
  );
};

export default App;
