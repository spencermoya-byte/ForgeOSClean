import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlugins, deletePlugin } from '../../api/plugin';
import { toast } from 'react-toastify';

const PluginList: React.FC = () => {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pluginToDelete, setPluginToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        const fetchedPlugins = await getPlugins();
        setPlugins(fetchedPlugins);
      } catch (error) {
        console.error('Failed to fetch plugins:', error);
        toast.error('Failed to load plugins');
      }
    };

    fetchPlugins();
  }, []);

  const handleDelete = async () => {
    if (!pluginToDelete) return;
    
    try {
      await deletePlugin(pluginToDelete);
      const updatedPlugins = plugins.filter(p => p.id !== pluginToDelete);
      setPlugins(updatedPlugins);
      toast.success('Plugin deleted successfully');
      setIsDeleteModalOpen(false);
      setPluginToDelete(null);
    } catch (err) {
      toast.error('Failed to delete plugin');
      console.error('Delete error:', err);
    }
  };

  const openDeleteModal = (id: string) => {
    setPluginToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPluginToDelete(null);
  };

  const handlePluginSelect = (id: string) => {
    navigate(`/plugins/${id}`);
  };

  const togglePluginStatus = async (id: string, isActive: boolean) => {
    try {
      // In a real implementation, this would call an API to update the plugin status
      // For now, we'll just update the UI
      const updatedPlugins = plugins.map(plugin => 
        plugin.id === id ? { ...plugin, isActive } : plugin
      );
      setPlugins(updatedPlugins);
      toast.success(`Plugin ${isActive ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update plugin status');
      console.error('Update error:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Plugins</h2>
        <button
          onClick={() => navigate('/plugins/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          Install Plugin
        </button>
      </div>

      {plugins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{plugin.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  plugin.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {plugin.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-300 mb-2">{plugin.description}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-400">
                  v{plugin.version}
                </span>
                <span className="text-sm text-gray-400">
                  {plugin.author}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => togglePluginStatus(plugin.id, !plugin.isActive)}
                    className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition duration-200"
                  >
                    {plugin.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handlePluginSelect(plugin.id)}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200"
                  >
                    Settings
                  </button>
                </div>
                <button
                  onClick={() => openDeleteModal(plugin.id)}
                  className="text-red-500 hover:text-red-400 transition duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No plugins installed</div>
          <button
            onClick={() => navigate('/plugins/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Install Your First Plugin
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this plugin? This action cannot be undone.</p>
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

export default PluginList;
