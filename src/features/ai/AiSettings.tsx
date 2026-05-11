import React, { useState, useEffect } from 'react';
import { getAiModels, getAiProviders, getAiModelStatus, getAiProviderStatus } from '../../api/ai';

const AiSettings: React.FC = () => {
  const [models, setModels] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [modelStatus, setModelStatus] = useState<any[]>([]);
  const [providerStatus, setProviderStatus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAiData = async () => {
      try {
        const [modelsData, providersData, modelStatusData, providerStatusData] = await Promise.all([
          getAiModels(),
          getAiProviders(),
          getAiModelStatus(),
          getAiProviderStatus()
        ]);
        
        setModels(modelsData);
        setProviders(providersData);
        setModelStatus(modelStatusData);
        setProviderStatus(providerStatusData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch AI data:', error);
        setIsLoading(false);
      }
    };

    fetchAiData();
  }, []);

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
      <h2 className="text-2xl font-bold text-white mb-6">AI Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">AI Models</h3>
          <div className="space-y-3">
            {models.map((model) => (
              <div key={model.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">{model.name}</h4>
                  <p className="text-sm text-gray-300">{model.description}</p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    model.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {model.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">AI Providers</h3>
          <div className="space-y-3">
            {providers.map((provider) => (
              <div key={provider.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">{provider.name}</h4>
                  <p className="text-sm text-gray-300">{provider.type}</p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    provider.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {provider.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">AI Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Model Status</h4>
            <div className="space-y-2">
              {modelStatus.map((status) => (
                <div key={status.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                  <span className="text-white">{status.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    status.isAvailable ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {status.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Provider Status</h4>
            <div className="space-y-2">
              {providerStatus.map((status) => (
                <div key={status.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                  <span className="text-white">{status.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    status.isAvailable ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {status.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">AI Features</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-semibold text-white">Workspace-Aware AI</h4>
              <p className="text-sm text-gray-300">AI understands your current workspace context</p>
            </div>
            <div className="relative inline-block w-12 h-6">
              <input type="checkbox" className="sr-only" defaultChecked />
              <div className="block w-12 h-6 rounded-full bg-blue-600"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-6"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-semibold text-white">AI Chat Assistant</h4>
              <p className="text-sm text-gray-300">Integrated chat interface for AI interactions</p>
            </div>
            <div className="relative inline-block w-12 h-6">
              <input type="checkbox" className="sr-only" defaultChecked />
              <div className="block w-12 h-6 rounded-full bg-blue-600"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-6"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-semibold text-white">Quick Actions</h4>
              <p className="text-sm text-gray-300">AI-powered quick actions for common tasks</p>
            </div>
            <div className="relative inline-block w-12 h-6">
              <input type="checkbox" className="sr-only" />
              <div className="block w-12 h-6 rounded-full bg-gray-600"></div>
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSettings;
