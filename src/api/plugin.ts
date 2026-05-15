export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  isActive: boolean;
  isSystem: boolean;
  capabilities: string;
  config: string;
  createdAt: string;
  updatedAt: string;
}

export interface PluginSetting {
  id: string;
  pluginId: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface PluginCapability {
  id: string;
  pluginId: string;
  capability: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePluginData {
  name: string;
  version: string;
  description: string;
  author: string;
  isActive: boolean;
  isSystem: boolean;
  capabilities: string;
  config: string;
}

export interface UpdatePluginData {
  name?: string;
  version?: string;
  description?: string;
  author?: string;
  isActive?: boolean;
  isSystem?: boolean;
  capabilities?: string;
  config?: string;
}

export const getPlugins = async (): Promise<Plugin[]> => {
  const response = await window.__TAURI__.invoke('get_plugins');
  return response as Plugin[];
};

export const getPlugin = async (id: string): Promise<Plugin> => {
  const response = await window.__TAURI__.invoke('get_plugin', { id });
  return response as Plugin;
};

export const createPlugin = async (data: CreatePluginData): Promise<Plugin> => {
  const response = await window.__TAURI__.invoke('create_plugin', { request: data });
  return response as Plugin;
};

export const updatePlugin = async (id: string, data: UpdatePluginData): Promise<Plugin> => {
  const response = await window.__TAURI__.invoke('update_plugin', { id, request: data });
  return response as Plugin;
};

export const deletePlugin = async (id: string): Promise<void> => {
  await window.__TAURI__.invoke('delete_plugin', { id });
};

export const getPluginSettings = async (pluginId: string): Promise<PluginSetting[]> => {
  const response = await window.__TAURI__.invoke('get_plugin_settings', { pluginId });
  return response as PluginSetting[];
};

export const getPluginSetting = async (pluginId: string, key: string): Promise<PluginSetting> => {
  const response = await window.__TAURI__.invoke('get_plugin_setting', { pluginId, key });
  return response as PluginSetting;
};

export const updatePluginSetting = async (id: string, value: string): Promise<PluginSetting> => {
  const response = await window.__TAURI__.invoke('update_plugin_setting', { id, value });
  return response as PluginSetting;
};

export const getPluginCapabilities = async (pluginId: string): Promise<PluginCapability[]> => {
  const response = await window.__TAURI__.invoke('get_plugin_capabilities', { pluginId });
  return response as PluginCapability[];
};

export const updatePluginCapability = async (id: string, isEnabled: boolean): Promise<PluginCapability> => {
  const response = await window.__TAURI__.invoke('update_plugin_capability', { id, isEnabled });
  return response as PluginCapability;
};
