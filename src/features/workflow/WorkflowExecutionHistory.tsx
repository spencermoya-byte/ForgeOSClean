import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getWorkflowExecutions } from '../../api/workflow';
import { toast } from 'react-toastify';

const WorkflowExecutionHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [executions, setExecutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExecutions = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const fetchedExecutions = await getWorkflowExecutions(id);
        setExecutions(fetchedExecutions);
      } catch (error) {
        console.error('Failed to fetch executions:', error);
        toast.error('Failed to load execution history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExecutions();
  }, [id]);

  if (isLoading) {
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
      <h2 className="text-2xl font-bold text-white mb-6">Execution History</h2>
      
      {executions.length > 0 ? (
        <div className="space-y-4">
          {executions.map((execution) => (
            <div key={execution.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">Execution #{execution.id.substring(0, 8)}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  execution.status === 'completed' ? 'bg-green-600 text-white' : 
                  execution.status === 'failed' ? 'bg-red-600 text-white' : 
                  'bg-yellow-600 text-white'
                }`}>
                  {execution.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Started:</span>
                  <span className="text-white ml-2">
                    {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : 'Not started'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Completed:</span>
                  <span className="text-white ml-2">
                    {execution.completedAt ? new Date(execution.completedAt).toLocaleString() : 'In progress'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white ml-2">
                    {new Date(execution.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              
              {execution.errorMessage && (
                <div className="mt-3 p-3 bg-red-900 text-red-100 rounded">
                  <p className="font-semibold">Error:</p>
                  <p>{execution.errorMessage}</p>
                </div>
              )}
              
              {execution.result && (
                <div className="mt-3 p-3 bg-gray-700 text-gray-100 rounded">
                  <p className="font-semibold">Result:</p>
                  <pre className="text-sm whitespace-pre-wrap">{execution.result}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No execution history found</p>
        </div>
      )}
    </div>
  );
};

export default WorkflowExecutionHistory;
