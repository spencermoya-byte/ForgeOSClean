import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkspaces, setActiveWorkspace, getActiveWorkspace } from '../../api/workspace';

interface WorkspaceSwitcherProps {
  className?: string;
}

const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ className = '' }) => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const fetchedWorkspaces = await getWorkspaces();
        setWorkspaces(fetchedWorkspaces);
        
        const activeWorkspace = await getActiveWorkspace();
        setActiveWorkspaceState(activeWorkspace);
      } catch (error) {
        console.error('Failed to fetch workspace data:', error);
      }
    };

    fetchWorkspaceData();
  }, []);

  const handleWorkspaceSelect = async (workspaceId: string) => {
    try {
      await setActiveWorkspace(workspaceId);
      const updatedWorkspace = await getActiveWorkspace();
      setActiveWorkspaceState(updatedWorkspace);
      setIsDropdownOpen(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to set active workspace:', error);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200"
      >
        <span className="truncate max-w-xs">{activeWorkspace?.name || 'Select Workspace'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <h3 className="text-sm font-semibold text-gray-400 px-2 py-1">Workspaces</h3>
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => handleWorkspaceSelect(workspace.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition duration-200 ${
                  activeWorkspace?.id === workspace.id 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-700 text-white'
                }`}
              >
                {workspace.name}
              </button>
            ))}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                navigate('/workspaces/new');
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 text-white transition duration-200 mt-2"
            >
              + Create New Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
