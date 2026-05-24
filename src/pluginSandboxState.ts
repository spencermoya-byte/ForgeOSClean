export type PluginSandboxState = {
  pluginId: string;
  isolated: boolean;
  terminalAllowed: boolean;
  networkAllowed: boolean;
  secretsAllowed: boolean;
  lastUpdated: string;
};

const STORAGE_KEY = 'vivus.pluginSandbox.v1';

export function readPluginSandboxState(): PluginSandboxState[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function updatePluginSandboxState(state: PluginSandboxState) {
  const current = readPluginSandboxState();
  const next = [
    state,
    ...current.filter((item) => item.pluginId !== state.pluginId),
  ];

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}

  window.dispatchEvent(
    new CustomEvent('vivus-plugin-sandbox-updated', {
      detail: state,
    })
  );

  return state;
}
