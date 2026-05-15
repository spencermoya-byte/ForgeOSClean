import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [aiModels, setAiModels] = useState<any[]>([]);
  const [aiProviders, setAiProviders] = useState<any[]>([]);

  // Mock data for dev mode
  useEffect(() => {
    // Simulate fetching data in dev mode
    setWorkspaces([
      { id: '1', name: 'Workspace 1', description: 'First workspace', path: '/workspace1' },
      { id: '2', name: 'Workspace 2', description: 'Second workspace', path: '/workspace2' }
    ]);
    
    setActiveWorkspace({ id: '1', name: 'Workspace 1' });
    
    setProjects([
      { id: '1', name: 'Project 1', description: 'First project' },
      { id: '2', name: 'Project 2', description: 'Second project' }
    ]);
    
    setActiveProject({ id: '1', name: 'Project 1' });
    
    setAiModels([
      { id: '1', name: 'Model 1', description: 'First AI model' },
      { id: '2', name: 'Model 2', description: 'Second AI model' }
    ]);
    
    setAiProviders([
      { id: '1', name: 'Provider 1', type: 'API' },
      { id: '2', name: 'Provider 2', type: 'Local' }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ForgeOS Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-green-400">Dev Mode Active</span>
            <span>Hello, {user?.username || 'User'}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Active Workspace: {activeWorkspace?.name || 'None'}</h2>
          <p className="text-gray-400 mb-4">Active Project: {activeProject?.name || 'None'}</p>
        </div>

        {/* Dev mode notice */}
        <div className="bg-yellow-900 border border-yellow-700 text-yellow-300 p-4 rounded-lg mb-6">
          <p className="font-semibold">Development Mode</p>
          <p className="text-sm">This is a development build with placeholder data. Real functionality will be implemented later.</p>
        </div>

        {/* Stats section */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Dashboard Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-400">Workspaces</p>
              <p className="text-xl font-bold">{workspaces.length}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-400">Projects</p>
              <p className="text-xl font-bold">{projects.length}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-400">AI Models</p>
              <p className="text-xl font-bold">{aiModels.length}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-400">AI Providers</p>
              <p className="text-xl font-bold">{aiProviders.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition duration-200"
            onClick={() => navigate('/resources')}
          >
            <h2 className="text-xl font-bold mb-2">Resources</h2>
            <p className="text-gray-300">Manage your application resources</p>
          </div>
          
          <div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition duration-200"
            onClick={() => navigate('/profile')}
          >
            <h2 className="text-xl font-bold mb-2">Profile</h2>
            <p className="text-gray-300">Manage your profile settings</p>
          </div>
          
          <div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition duration-200"
            onClick={() => navigate('/settings')}
          >
            <h2 className="text-xl font-bold mb-2">Settings</h2>
            <p className="text-gray-300">Configure application settings</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition duration-200"
            onClick={() => navigate('/ai/settings')}
          >
            <h2 className="text-xl font-bold mb-2">AI Settings</h2>
            <p className="text-gray-300">Configure AI providers and models</p>
          </div>
          
          <div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition duration-200"
            onClick={() => navigate('/marketplace')}
          >
            <h2 className="text-xl font-bold mb-2">Marketplace</h2>
            <p className="text-gray-300">Browse and manage extensions</p>
          </div>
        </div>

        {/* Placeholder cards for key sections */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Projects</h4>
              <p className="text-sm text-gray-300">{projects.length} projects</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Workspaces</h4>
              <p className="text-sm text-gray-300">{workspaces.length} workspaces</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">AI Models</h4>
              <p className="text-sm text-gray-300">{aiModels.length} models</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Plugins</h4>
              <p className="text-sm text-gray-300">0 plugins</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
