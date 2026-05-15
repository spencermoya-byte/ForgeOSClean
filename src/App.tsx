import React from "react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-3xl font-bold mb-2">ForgeOS</h1>
        <p className="text-green-400 text-xl">Frontend is running</p>
        <p className="text-yellow-400">Dev Mode Active</p>
      </div>
      
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Dashboard Mockup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Dashboard</h3>
            <p className="text-gray-300">Main application dashboard</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Marketplace</h3>
            <p className="text-gray-300">Browse and manage extensions</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">AI</h3>
            <p className="text-gray-300">AI assistant and settings</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Projects</h3>
            <p className="text-gray-300">Manage your projects</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Workspaces</h3>
            <p className="text-gray-300">Manage your workspaces</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Resources</h3>
            <p className="text-gray-300">Manage application resources</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
            <p className="text-gray-300">Application settings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
