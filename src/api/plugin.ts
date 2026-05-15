import { invoke } from "@tauri-apps/api/core";

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
  const result = await invoke('get_plugins');
  return result as Plugin[];
};

export const getPlugin = async (id: string): Promise<Plugin> => {
  const result = await invoke('get_plugin', { id });
  return result as Plugin;
};

export const createPlugin = async (data: CreatePluginData): Promise<Plugin> => {
  const result = await invoke('create_plugin', { data });
  return result as Plugin;
};

export const updatePlugin = async (id: string, data: UpdatePluginData): Promise<Plugin> => {
  const result = await invoke('update_plugin', { id, data });
  return result as Plugin;
};

export const deletePlugin = async (id: string): Promise<void> => {
  await invoke('delete_plugin', { id });
};

export const getPluginSettings = async (pluginId: string): Promise<PluginSetting[]> => {
  const result = await invoke('get_plugin_settings', { pluginId });
  return result as PluginSetting[];
};

export const getPluginSetting = async (pluginId: string, key: string): Promise<PluginSetting> => {
  const result = await invoke('get_plugin_setting', { pluginId, key });
  return result as PluginSetting;
};

export const updatePluginSetting = async (id: string, value: string): Promise<PluginSetting> => {
  const result = await invoke('update_plugin_setting', { id, value });
  return result as PluginSetting;
};

export const getPluginCapabilities = async (pluginId: string): Promise<PluginCapability[]> => {
  const result = await invoke('get_plugin_capabilities', { pluginId });
  return result as PluginCapability[];
};

export const updatePluginCapability = async (id: string, isEnabled: boolean): Promise<PluginCapability> => {
  const result = await invoke('update_plugin_capability', { id, isEnabled });
  return result as PluginCapability;
};
