import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlugin, updatePlugin, getPluginSettings, getPluginCapabilities } from '../../api/plugin';
import { toast } from 'react-toastify';

const PluginDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plugin, setPlugin] = useState<any | null>(null);
  const [settings, setSettings] = useState<any[]>([]);
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  useEffect(() => {
    const fetchPlugin = async () => {
      if (!id) return;
        
      try {
        setLoading(true);
        const fetchedPlugin = await getPlugin(id);
        setPlugin(fetchedPlugin);
          
        const fetchedSettings = await getPluginSettings(id);
        setSettings(fetchedSettings);
          
        const fetchedCapabilities = await getPluginCapabilities(id);
        setCapabilities(fetchedCapabilities);
      } catch (error) {
        console.error('Failed to fetch plugin:', error);
        toast.error('Failed to load plugin');
      } finally {
        setLoading(false);
      }
    };

    fetchPlugin();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      if (plugin) {
        await updatePlugin(id, plugin);
        toast.success('Plugin updated successfully');
      }
    } catch (error) {
      console.error('Failed to update plugin:', error);
      toast.error('Failed to update plugin');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSettingChange = (id: string, value: string) => {
    const updatedSettings = settings.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    );
    setSettings(updatedSettings);
  };

  const handleUpdateSetting = async (id: string, value: string) => {
    setIsUpdatingSettings(true);
    try {
      await updatePluginSetting(id, value);
      toast.success('Setting updated successfully');
      // Refresh settings
      const fetchedSettings = await getPluginSettings(id);
      setSettings(fetchedSettings);
    } catch (error) {
      console.error('Failed to update setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleCapabilityToggle = async (id: string, isEnabled: boolean) => {
    try {
      await updatePluginCapability(id, isEnabled);
      toast.success('Capability updated successfully');
      // Refresh capabilities
      const fetchedCapabilities = await getPluginCapabilities(id);
      setCapabilities(fetchedCapabilities);
    } catch (error) {
      console.error('Failed to update capability:', error);
      toast.error('Failed to update capability');
    }
  };

  if (loading) {
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

  if (!plugin) {
    return (
      <div className="p-4">
        <p className="text-red-500">Plugin not found</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-white">{plugin.name}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/plugins')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Back to Plugins
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6 md:p-8 md:mb-8">
        <p className="text-gray-300 mb-6">{plugin.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Details</h3>
            <div className="space-y-2">
              <div className="flex">
                <span className="text-gray-400 w-32">Version:</span>
                <span className="text-white">{plugin.version}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Author:</span>
                <span className="text-white">{plugin.author}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Created:</span>
                <span className="text-white">{new Date(plugin.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Updated:</span>
                <span className="text-white">{new Date(plugin.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Status:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  plugin.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {plugin.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Capabilities</h3>
            <div className="space-y-2">
              {capabilities.length > 0 ? (
                capabilities.map((capability) => (
                  <div key={capability.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                    <span className="text-white">{capability.capability}</span>
                    <button
                      onClick={() => handleCapabilityToggle(capability.id, !capability.isEnabled)}
                      className={`px-3 py-1 rounded text-xs ${
                        capability.isEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                      aria-label={`${capability.capability} is ${capability.isEnabled ? 'enabled' : 'disabled'}`}
                    >
                      {capability.isEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No capabilities defined</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Settings</h3>
        {settings.length > 0 ? (
          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.id} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{setting.key}</h4>
                </div>
                <textarea
                  value={setting.value}
                  onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                  className="w-full p-3 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleUpdateSetting(setting.id, setting.value)}
                    disabled={isUpdatingSettings}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg transition duration-200 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No settings defined for this plugin</p>
        )}
      </div>
    </div>
  );
};

export default PluginDetail;
