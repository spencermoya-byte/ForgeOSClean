import { listVivusPlugins } from './pluginRegistry';
import { togglePluginDock, readPluginDockState } from './pluginDockController';

function renderDockPanel(container: HTMLElement) {
  const state = readPluginDockState();
  const plugins = listVivusPlugins().filter((plugin) => plugin.panelId);

  container.innerHTML = `
    <div class="plugin-dock-header">
      <strong>Plugins</strong>
    </div>
    <div class="plugin-dock-list">
      ${plugins.map((plugin) => `
        <button
          type="button"
          class="plugin-dock-item ${state.activePanel === plugin.panelId ? 'active' : ''}"
          data-panel-id="${plugin.panelId}"
        >
          ${plugin.name}
        </button>
      `).join('')}
    </div>
  `;

  container.querySelectorAll<HTMLButtonElement>('[data-panel-id]').forEach((button) => {
    button.addEventListener('click', () => {
      togglePluginDock(button.dataset.panelId ?? null);
      renderDockPanel(container);
    });
  });
}

function installPluginDock() {
  const workspaceDock = document.querySelector('.workspace-dock');
  if (!workspaceDock || document.querySelector('.plugin-dock-panel')) return;

  const panel = document.createElement('div');
  panel.className = 'plugin-dock-panel';

  renderDockPanel(panel);
  document.body.appendChild(panel);
}

export function startPluginDockInstaller() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const install = () => window.setTimeout(installPluginDock, 0);
  install();

  const observer = new MutationObserver(install);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
