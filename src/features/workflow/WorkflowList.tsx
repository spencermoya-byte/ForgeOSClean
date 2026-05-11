import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkflows, deleteWorkflow } from '../../api/workflow';
import { toast } from 'react-toastify';

const WorkflowList: React.FC = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const fetchedWorkflows = await getWorkflows();
        setWorkflows(fetchedWorkflows);
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
        toast.error('Failed to load workflows');
      }
    };

    fetchWorkflows();
  }, []);

  const handleDelete = async () => {
    if (!workflowToDelete) return;
    
    try {
      await deleteWorkflow(workflowToDelete);
      const updatedWorkflows = workflows.filter(w => w.id !== workflowToDelete);
      setWorkflows(updatedWorkflows);
      toast.success('Workflow deleted successfully');
      setIsDeleteModalOpen(false);
      setWorkflowToDelete(null);
    } catch (err) {
      toast.error('Failed to delete workflow');
      console.error('Delete error:', err);
    }
  };

  const openDeleteModal = (id: string) => {
    setWorkflowToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setWorkflowToDelete(null);
  };

  const handleWorkflowSelect = (id: string) => {
    navigate(`/workflows/${id}`);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Workflows</h2>
        <button
          onClick={() => navigate('/workflows/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          Create Workflow
        </button>
      </div>

      {workflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{workflow.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  workflow.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {workflow.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-300 mb-4">{workflow.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  Trigger: {workflow.triggerType}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleWorkflowSelect(workflow.id)}
                    className="text-blue-400 hover:text-blue-300 transition duration-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openDeleteModal(workflow.id)}
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
          <div className="text-gray-400 mb-4">No workflows found</div>
          <button
            onClick={() => navigate('/workflows/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Create Your First Workflow
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this workflow? This action cannot be undone.</p>
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

export default WorkflowList;
