import { listPluginAuditTrail } from './pluginAuditTrail';

function renderAuditPanel(container: HTMLElement) {
  const entries = listPluginAuditTrail().slice(0, 30);

  container.innerHTML = `
    <div class="plugin-audit-header">
      <strong>Plugin Audit</strong>
      <p>${entries.length} recent plugin event${entries.length === 1 ? '' : 's'}.</p>
    </div>
    <div class="plugin-audit-list">
      ${entries.length ? entries.map((entry) => `
        <div class="plugin-audit-card ${entry.status}">
          <div>
            <strong>${entry.label}</strong>
            <p>${entry.detail}</p>
            <span>${entry.pluginId}</span>
          </div>
          <em>${entry.status}</em>
        </div>
      `).join('') : '<div class="plugin-audit-empty">No plugin activity recorded yet.</div>'}
    </div>
  `;
}

function installPluginAuditPanel() {
  const dock = document.querySelector('.workspace-dock');
  if (!dock || document.querySelector('.plugin-audit-panel')) return;

  const panel = document.createElement('div');
  panel.className = 'plugin-audit-panel';
  renderAuditPanel(panel);
  document.body.appendChild(panel);

  window.addEventListener('vivus-plugin-audit-updated', () => renderAuditPanel(panel));
}

export function startPluginAuditPanel() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const install = () => window.setTimeout(installPluginAuditPanel, 0);
  install();

  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
