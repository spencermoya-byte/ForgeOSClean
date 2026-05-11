import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkflow, updateWorkflow, createWorkflow } from '../../api/workflow';
import { toast } from 'react-toastify';

const WorkflowEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    workspaceId: null as string | null,
    projectId: null as string | null,
    triggerType: 'manual',
    triggerConfig: '{}',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!id) return;
      
      try {
        const fetchedWorkflow = await getWorkflow(id);
        setWorkflow({
          name: fetchedWorkflow.name,
          description: fetchedWorkflow.description,
          workspaceId: fetchedWorkflow.workspaceId,
          projectId: fetchedWorkflow.projectId,
          triggerType: fetchedWorkflow.triggerType,
          triggerConfig: fetchedWorkflow.triggerConfig,
          isActive: fetchedWorkflow.isActive,
        });
      } catch (error) {
        console.error('Failed to fetch workflow:', error);
        toast.error('Failed to load workflow');
      }
    };

    if (id) {
      fetchWorkflow();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
    setWorkflow(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (id) {
        // Update existing workflow
        await updateWorkflow(id, workflow);
        toast.success('Workflow updated successfully');
      } else {
        // Create new workflow
        await createWorkflow(workflow);
        toast.success('Workflow created successfully');
      }
      navigate('/workflows');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {id ? 'Edit Workflow' : 'Create New Workflow'}
        </h2>
        <button
          onClick={() => navigate('/workflows')}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          Back to Workflows
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={workflow.name}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-white mb-2">Trigger Type</label>
            <select
              name="triggerType"
              value={workflow.triggerType}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="manual">Manual</option>
              <option value="scheduled">Scheduled</option>
              <option value="workspace_event">Workspace Event</option>
              <option value="resource_event">Resource Event</option>
              <option value="ai_contextual">AI Contextual</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-white mb-2">Description</label>
            <textarea
              name="description"
              value={workflow.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-white mb-2">Workspace</label>
            <select
              name="workspaceId"
              value={workflow.workspaceId || ''}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Workspace</option>
              {/* In a real app, you would populate this with actual workspaces */}
            </select>
          </div>
          
          <div>
            <label className="block text-white mb-2">Project</label>
            <select
              name="projectId"
              value={workflow.projectId || ''}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Project</option>
              {/* In a real app, you would populate this with actual projects */}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-white mb-2">Trigger Configuration</label>
            <textarea
              name="triggerConfig"
              value={workflow.triggerConfig}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="JSON configuration for the trigger"
            />
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={workflow.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-white">Active</label>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/workflows')}
            className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkflowEditor;
