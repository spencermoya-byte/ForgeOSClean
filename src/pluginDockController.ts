const STORAGE_KEY = 'vivus.pluginDock.v1';

export type PluginDockState = {
  isOpen: boolean;
  activePanel: string | null;
};

function saveDockState(state: PluginDockState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function readPluginDockState(): PluginDockState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { isOpen: false, activePanel: null };
  } catch {
    return { isOpen: false, activePanel: null };
  }
}

export function updatePluginDockState(next: Partial<PluginDockState>) {
  const current = readPluginDockState();
  const merged = { ...current, ...next };

  saveDockState(merged);

  window.dispatchEvent(
    new CustomEvent('vivus-plugin-dock-updated', {
      detail: merged,
    })
  );

  return merged;
}

export function togglePluginDock(activePanel?: string | null) {
  const current = readPluginDockState();

  return updatePluginDockState({
    isOpen: !current.isOpen,
    activePanel: activePanel ?? current.activePanel,
  });
}
