import { listVivusPlugins, updateVivusPluginStatus, type VivusPlugin } from './pluginRegistry';
import { evaluatePluginPermission } from './pluginPermissionPolicy';

function permissionBadge(plugin: VivusPlugin) {
  return plugin.permissions.map((permission) => {
    const evaluation = evaluatePluginPermission(plugin.id, permission);
    return `<span class="plugin-permission ${evaluation.requiresApproval ? 'high-risk' : ''}">${permission}</span>`;
  }).join('');
}

function renderPluginCard(plugin: VivusPlugin) {
  const disabled = plugin.status === 'disabled' || plugin.status === 'blocked';

  return `
    <div class="plugin-card" data-plugin-id="${plugin.id}">
      <div class="plugin-card-top">
        <div>
          <strong>${plugin.name}</strong>
          <p>${plugin.description}</p>
        </div>
        <button type="button" class="plugin-toggle-button">
          ${disabled ? 'Enable' : 'Disable'}
        </button>
      </div>
      <div class="plugin-meta">
        <span>${plugin.version}</span>
        <span>${plugin.author}</span>
        <span>${plugin.status}</span>
      </div>
      <div class="plugin-permissions">
        ${permissionBadge(plugin)}
      </div>
    </div>
  `;
}

function renderManager(container: HTMLElement) {
  const plugins = listVivusPlugins();

  container.innerHTML = `
    <div class="plugin-manager-header">
      <div>
        <strong>Plugin Manager</strong>
        <p>Manage permissions and runtime access for Vivus plugins.</p>
      </div>
    </div>
    <div class="plugin-manager-list">
      ${plugins.map(renderPluginCard).join('')}
    </div>
  `;

  container.querySelectorAll<HTMLElement>('.plugin-card').forEach((card) => {
    const pluginId = card.dataset.pluginId;
    const button = card.querySelector<HTMLButtonElement>('.plugin-toggle-button');
    if (!pluginId || !button) return;

    button.addEventListener('click', () => {
      const plugin = plugins.find((item) => item.id === pluginId);
      if (!plugin || plugin.createdAt === 'core') return;

      updateVivusPluginStatus(
        pluginId,
        plugin.status === 'enabled' ? 'disabled' : 'enabled'
      );

      renderManager(container);
    });
  });
}

function installPluginManager() {
  const dock = document.querySelector('.workspace-dock');
  if (!dock || document.querySelector('.plugin-manager-panel')) return;

  const panel = document.createElement('div');
  panel.className = 'plugin-manager-panel';
  renderManager(panel);
  document.body.appendChild(panel);
}

export function startPluginManagerInstaller() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const install = () => window.setTimeout(installPluginManager, 0);
  install();

  const observer = new MutationObserver(install);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
