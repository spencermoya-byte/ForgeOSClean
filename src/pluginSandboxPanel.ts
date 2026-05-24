import { listVivusPlugins } from './pluginRegistry';
import { readPluginSandboxState, updatePluginSandboxState } from './pluginSandboxState';

function ensureSandboxState(pluginId: string) {
  const existing = readPluginSandboxState().find((state) => state.pluginId === pluginId);
  if (existing) return existing;

  return updatePluginSandboxState({
    pluginId,
    isolated: true,
    terminalAllowed: false,
    networkAllowed: false,
    secretsAllowed: false,
    lastUpdated: new Date().toISOString(),
  });
}

function renderSandboxPanel(container: HTMLElement) {
  const plugins = listVivusPlugins();
  const states = plugins.map((plugin) => ensureSandboxState(plugin.id));

  container.innerHTML = `
    <div class="plugin-sandbox-header">
      <strong>Plugin Sandbox</strong>
      <p>Runtime isolation and sensitive access boundaries.</p>
    </div>
    <div class="plugin-sandbox-list">
      ${plugins.map((plugin) => {
        const state = states.find((item) => item.pluginId === plugin.id);
        return `
          <div class="plugin-sandbox-card">
            <strong>${plugin.name}</strong>
            <div class="plugin-sandbox-grid">
              <span>Isolated: ${state?.isolated ? 'yes' : 'no'}</span>
              <span>Terminal: ${state?.terminalAllowed ? 'allowed' : 'blocked'}</span>
              <span>Network: ${state?.networkAllowed ? 'allowed' : 'blocked'}</span>
              <span>Secrets: ${state?.secretsAllowed ? 'allowed' : 'blocked'}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function installPluginSandboxPanel() {
  const dock = document.querySelector('.workspace-dock');
  if (!dock || document.querySelector('.plugin-sandbox-panel')) return;

  const panel = document.createElement('div');
  panel.className = 'plugin-sandbox-panel';
  renderSandboxPanel(panel);
  document.body.appendChild(panel);

  window.addEventListener('vivus-plugin-sandbox-updated', () => renderSandboxPanel(panel));
}

export function startPluginSandboxPanel() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const install = () => window.setTimeout(installPluginSandboxPanel, 0);
  install();

  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
