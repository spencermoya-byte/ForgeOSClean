import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlugins } from '../../api/plugin';
import { toast } from 'react-toastify';

const PluginManagement: React.FC = () => {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchPlugins = async () => {
      try {
        setIsLoading(true);
        const fetchedPlugins = await getPlugins();
        setPlugins(fetchedPlugins);
      } catch (error) {
        console.error('Failed to fetch plugins:', error);
        toast.error('Failed to load plugins');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlugins();
  }, []);

  const handleInstallPlugin = () => {
    // In a real implementation, this would open a plugin marketplace or file browser
    toast.info('Plugin installation would open here');
  };

  const handlePluginClick = (id: string) => {
    navigate(`/plugins/${id}`);
  };

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Plugin Management</h2>
        <button
          onClick={handleInstallPlugin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          Install Plugin
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Plugin Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-2">Total Plugins</h4>
            <p className="text-3xl font-bold text-blue-400">{plugins.length}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-2">Active Plugins</h4>
            <p className="text-3xl font-bold text-green-400">
              {plugins.filter(p => p.isActive).length}
            </p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-2">System Plugins</h4>
            <p className="text-3xl font-bold text-purple-400">
              {plugins.filter(p => p.isSystem).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Installed Plugins</h3>
        {plugins.length > 0 ? (
          <div className="space-y-4">
            {plugins.map((plugin) => (
              <div 
                key={plugin.id} 
                className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200 cursor-pointer"
                onClick={() => handlePluginClick(plugin.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-white text-lg">{plugin.name}</h4>
                    <p className="text-gray-300">{plugin.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    plugin.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {plugin.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="text-sm text-gray-400">
                    v{plugin.version} by {plugin.author}
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200">
                      Configure
                    </button>
                    <button className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition duration-200">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No plugins installed</p>
            <button
              onClick={handleInstallPlugin}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Install Plugins
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginManagement;
