import React from "react";

// Safe recovery shell component
const RecoveryShell = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 p-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center">ForgeOS Recovery Shell</h1>
        <p className="text-green-400 text-center mt-2">React is rendering successfully</p>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Navigation</h2>
          <p className="text-gray-300 mb-4">This is a recovery shell showing that the frontend is working.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="#/dashboard" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              Dashboard
            </a>
            <a href="#/marketplace" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              Marketplace
            </a>
            <a href="#/ai" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              AI
            </a>
            <a href="#/projects" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              Projects
            </a>
            <a href="#/workspaces" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              Workspaces
            </a>
            <a href="#/resources" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              Resources
            </a>
            <a href="#/settings" className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 text-center">
              Settings
            </a>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Frontend is running</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>React is rendering</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>Features are being restored</span>
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
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
            <p className="text-gray-300 mb-4">Placeholder page — system restoration in progress</p>
            <p className="text-gray-400 mb-6">This section will display the marketplace functionality once restored.</p>
            <button 
              onClick={() => window.location.hash = '#/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        );
      case 'ai':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">AI</h1>
            <p className="text-gray-300 mb-4">Placeholder page — system restoration in progress</p>
            <p className="text-gray-400 mb-6">This section will display AI functionality once restored.</p>
            <button 
              onClick={() => window.location.hash = '#/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        );
      case 'projects':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Projects</h1>
            <p className="text-gray-300 mb-4">Placeholder page — system restoration in progress</p>
            <p className="text-gray-400 mb-6">This section will display project management functionality once restored.</p>
            <button 
              onClick={() => window.location.hash = '#/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        );
      case 'workspaces':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Workspaces</h1>
            <p className="text-gray-300 mb-4">Placeholder page — system restoration in progress</p>
            <p className="text-gray-400 mb-6">This section will display workspace management functionality once restored.</p>
            <button 
              onClick={() => window.location.hash = '#/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        );
      case 'resources':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Resources</h1>
            <p className="text-gray-300 mb-4">Placeholder page — system restoration in progress</p>
            <p className="text-gray-400 mb-6">This section will display resource management functionality once restored.</p>
            <button 
              onClick={() => window.location.hash = '#/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <p className="text-gray-300 mb-4">Placeholder page — system restoration in progress</p>
            <p className="text-gray-400 mb-6">This section will display application settings once restored.</p>
            <button 
              onClick={() => window.location.hash = '#/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <p className="text-gray-300 mb-4">The page you are looking for does not exist.</p>
            <button 
              onClick={() => window.location.hash = '#/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {renderRoute()}
    </div>
  );
};

export default App;
