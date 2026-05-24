export type PluginPermission =
  | 'filesystem'
  | 'network'
  | 'terminal'
  | 'workspace';

export type VivusPlugin = {
  id: string;
  name: string;
  permissions: PluginPermission[];
  enabled: boolean;
};

let plugins: VivusPlugin[] = [];

export function registerPlugin(
  plugin: VivusPlugin,
) {
  plugins.push(plugin);

  window.dispatchEvent(
    new CustomEvent('vivus-plugins', {
      detail: plugins,
    }),
  );

  return plugin;
}

export function listPlugins() {
  return plugins;
}

export function isPluginAllowed(
  pluginId: string,
  permission: PluginPermission,
) {
  const plugin = plugins.find(
    (p) => p.id === pluginId,
  );

  if (!plugin?.enabled) {
    return false;
  }

  return plugin.permissions.includes(permission);
}
