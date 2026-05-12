import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authContext';
import { getWorkspaces, getActiveWorkspace } from '../../api/workspace';
import { getProjects, getActiveProject } from '../../api/project';
import { getAiModels, getAiProviders } from '../../api/ai';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [aiModels, setAiModels] = useState<any[]>([]);
  const [aiProviders, setAiProviders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const fetchedWorkspaces = await getWorkspaces();
        setWorkspaces(fetchedWorkspaces);
        
        const activeWorkspace = await getActiveWorkspace();
        setActiveWorkspace(activeWorkspace);
        
        if (activeWorkspace) {
          const fetchedProjects = await getProjects(activeWorkspace.id);
          setProjects(fetchedProjects);
          
          const activeProject = await getActiveProject();
          setActiveProject(activeProject);
        }
        
        // Fetch AI data
        const fetchedModels = await getAiModels();
        setAiModels(fetchedModels);
        
        const fetchedProviders = await getAiProviders();
        setAiProviders(fetchedProviders);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ForgeOS Dashboard</h1>
          <div className="flex items-center space-x-4">
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
      </main>
    </div>
  );
};

export default Dashboard;
