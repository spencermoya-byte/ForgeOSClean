import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkspaces, deleteWorkspace, setActiveWorkspace, getActiveWorkspace } from '../../api/workspace';
import { toast } from 'react-toastify';

const WorkspaceList: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const fetchedWorkspaces = await getWorkspaces();
        setWorkspaces(fetchedWorkspaces);
        
        const activeWorkspace = await getActiveWorkspace();
        setActiveWorkspaceState(activeWorkspace);
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      }
    };

    fetchWorkspaces();
  }, []);

  const handleDelete = async () => {
    if (!workspaceToDelete) return;
    
    try {
      await deleteWorkspace(workspaceToDelete);
      const updatedWorkspaces = workspaces.filter(w => w.id !== workspaceToDelete);
      setWorkspaces(updatedWorkspaces);
      toast.success('Workspace deleted successfully');
      setIsDeleteModalOpen(false);
      setWorkspaceToDelete(null);
    } catch (err) {
      toast.error('Failed to delete workspace');
      console.error('Delete error:', err);
    }
  };

  const openDeleteModal = (id: string) => {
    setWorkspaceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setWorkspaceToDelete(null);
  };

  const handleWorkspaceSelect = async (workspaceId: string) => {
    try {
      await setActiveWorkspace(workspaceId);
      const updatedActiveWorkspace = await getActiveWorkspace();
      setActiveWorkspaceState(updatedActiveWorkspace);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to set active workspace:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Workspaces</h2>
        <button
          onClick={() => navigate('/workspaces/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          Create Workspace
        </button>
      </div>

      {workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div key={workspace.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{workspace.name}</h3>
                {activeWorkspace?.id === workspace.id && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Active</span>
                )}
              </div>
              <p className="text-gray-300 mb-4">{workspace.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  {workspace.path}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleWorkspaceSelect(workspace.id)}
                    className="text-blue-400 hover:text-blue-300 transition duration-200"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => openDeleteModal(workspace.id)}
                    className="text-red-500 hover:text-red-400 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No workspaces found</div>
          <button
            onClick={() => navigate('/workspaces/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Create Your First Workspace
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this workspace? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceList;
