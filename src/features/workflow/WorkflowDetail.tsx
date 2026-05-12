import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkflow, getWorkflowSteps, createWorkflowExecution } from '../../api/workflow';
import { toast } from 'react-toastify';

const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!id) return;
      
      try {
        const fetchedWorkflow = await getWorkflow(id);
        setWorkflow(fetchedWorkflow);
        
        const fetchedSteps = await getWorkflowSteps(id);
        setSteps(fetchedSteps);
      } catch (error) {
        console.error('Failed to fetch workflow:', error);
        toast.error('Failed to load workflow');
      }
    };

    fetchWorkflow();
  }, [id]);

  const handleExecute = async () => {
    if (!id) return;
    
    setIsExecuting(true);
    try {
      await createWorkflowExecution(id);
      toast.success('Workflow execution started');
      // In a real app, you would navigate to execution history or show status
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      toast.error('Failed to execute workflow');
    } finally {
      setIsExecuting(false);
    }
  };

  if (!workflow) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-4/6 mb-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-white">{workflow.name}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/workflows/${workflow.id}/edit`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Edit
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isExecuting ? 'Executing...' : 'Execute'}
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <p className="text-gray-300 mb-6">{workflow.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Details</h3>
            <div className="space-y-2">
              <div className="flex">
                <span className="text-gray-400 w-32">Created:</span>
                <span className="text-white">{new Date(workflow.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Updated:</span>
                <span className="text-white">{new Date(workflow.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Trigger:</span>
                <span className="text-white">{workflow.triggerType}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Status:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  workflow.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {workflow.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Workflow Steps</h3>
        {steps.length > 0 ? (
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{step.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    step.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {step.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-300 mb-2">{step.description}</p>
                <div className="text-sm text-gray-400">
                  Type: {step.stepType} | Position: {step.position}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No steps defined for this workflow</p>
        )}
      </div>
    </div>
  );
};

export default WorkflowDetail;
