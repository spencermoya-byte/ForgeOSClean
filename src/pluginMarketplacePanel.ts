import { listMarketplacePlugins } from './pluginMarketplace';
import { listPluginInstallQueue, queuePluginInstall } from './pluginInstallQueue';

function renderMarketplacePanel(container: HTMLElement) {
  const plugins = listMarketplacePlugins();
  const installs = listPluginInstallQueue();

  container.innerHTML = `
    <div class="plugin-marketplace-header">
      <strong>Plugin Marketplace</strong>
      <p>Review plugin permissions before installing into Vivus.</p>
    </div>
    <div class="plugin-marketplace-list">
      ${plugins.map((plugin) => {
        const install = installs.find((item) => item.pluginId === plugin.id);
        return `
          <div class="plugin-marketplace-card" data-marketplace-plugin-id="${plugin.id}">
            <div class="plugin-marketplace-card-top">
              <div>
                <strong>${plugin.name}</strong>
                <p>${plugin.description}</p>
              </div>
              <button type="button" class="plugin-marketplace-install-button" ${install ? 'disabled' : ''}>
                ${install ? install.status : 'Install'}
              </button>
            </div>
            <div class="plugin-marketplace-meta">
              <span>${plugin.trustLevel}</span>
              <span>${plugin.version}</span>
              <span>${plugin.author}</span>
            </div>
            <div class="plugin-marketplace-permissions">
              ${plugin.permissions.map((permission) => `<span>${permission}</span>`).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelectorAll<HTMLElement>('.plugin-marketplace-card').forEach((card) => {
    const pluginId = card.dataset.marketplacePluginId;
    const button = card.querySelector<HTMLButtonElement>('.plugin-marketplace-install-button');
    if (!pluginId || !button) return;

    button.addEventListener('click', () => {
      queuePluginInstall(pluginId);
      renderMarketplacePanel(container);
    });
  });
}

function installMarketplacePanel() {
  const dock = document.querySelector('.workspace-dock');
  if (!dock || document.querySelector('.plugin-marketplace-panel')) return;

  const panel = document.createElement('div');
  panel.className = 'plugin-marketplace-panel';
  renderMarketplacePanel(panel);
  document.body.appendChild(panel);

  window.addEventListener('vivus-plugin-marketplace-updated', () => renderMarketplacePanel(panel));
  window.addEventListener('vivus-plugin-install-updated', () => renderMarketplacePanel(panel));
}

export function startPluginMarketplacePanel() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const install = () => window.setTimeout(installMarketplacePanel, 0);
  install();

  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
