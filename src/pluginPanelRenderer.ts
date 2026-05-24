import { listVivusPlugins } from './pluginRegistry';
import { readPluginDockState } from './pluginDockController';
import { getPluginRuntimeSummary } from './pluginRuntimeSummary';

function activePlugin() {
  const state = readPluginDockState();
  if (!state.activePanel) return null;
  return listVivusPlugins().find((plugin) => plugin.panelId === state.activePanel) ?? null;
}

function renderPanel(container: HTMLElement) {
  const plugin = activePlugin();

  if (!plugin) {
    container.innerHTML = `
      <div class="plugin-panel-empty">
        <strong>No plugin selected</strong>
        <p>Select a plugin from the plugin dock.</p>
      </div>
    `;
    return;
  }

  const runtime = getPluginRuntimeSummary(plugin.id);

  container.innerHTML = `
    <div class="plugin-panel-card">
      <div class="plugin-panel-header">
        <div>
          <strong>${plugin.name}</strong>
          <p>${plugin.description}</p>
        </div>
        <span>${runtime.status}</span>
      </div>
      <div class="plugin-panel-body">
        <p>${runtime.note}</p>
        <div class="plugin-panel-meta">
          <span>Panel: ${plugin.panelId ?? 'none'}</span>
          <span>Version: ${plugin.version}</span>
          <span>Status: ${plugin.status}</span>
        </div>
      </div>
    </div>
  `;
}

function installPluginPanelRenderer() {
  const dock = document.querySelector('.workspace-dock');
  if (!dock || document.querySelector('.plugin-runtime-panel')) return;

  const container = document.createElement('div');
  container.className = 'plugin-runtime-panel';
  renderPanel(container);
  document.body.appendChild(container);

  window.addEventListener('vivus-plugin-dock-updated', () => renderPanel(container));
  window.addEventListener('vivus-plugin-runtime-state', () => renderPanel(container));
}

export function startPluginPanelRenderer() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const install = () => window.setTimeout(installPluginPanelRenderer, 0);
  install();

  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
