import { listVivusPlugins } from './pluginRegistry';
import { getPluginRuntimeSummary } from './pluginRuntimeSummary';
import { listPluginApprovals } from './pluginApprovalQueue';
import { listPluginAuditTrail } from './pluginAuditTrail';

function removeLegacyFloatingPluginPanels() {
  document
    .querySelectorAll('.plugin-manager-panel, .plugin-dock-panel, .plugin-runtime-panel, .plugin-approval-panel, .plugin-audit-panel, .plugin-sandbox-panel, .plugin-marketplace-panel')
    .forEach((node) => node.remove());
}

function renderWorkspacePluginRail(container: HTMLElement) {
  const plugins = listVivusPlugins();
  const approvals = listPluginApprovals();
  const pendingApprovals = approvals.filter((approval) => approval.status === 'pending');
  const auditEntries = listPluginAuditTrail().slice(0, 3);

  container.innerHTML = `
    <section class="workspace-rail-card compact">
      <div class="workspace-rail-card-header">
        <div>
          <strong>Plugin Approvals</strong>
          <p>${pendingApprovals.length} pending permission request${pendingApprovals.length === 1 ? '' : 's'}.</p>
        </div>
        <span>${pendingApprovals.length} Pending</span>
      </div>
      ${pendingApprovals.length ? pendingApprovals.map((approval) => `
        <div class="workspace-rail-mini-row">
          <strong>${approval.permission}</strong>
          <em>${approval.pluginId}</em>
        </div>
      `).join('') : '<div class="workspace-rail-empty">No pending permission requests.</div>'}
    </section>

    <section class="workspace-rail-card">
      <div class="workspace-rail-card-header">
        <div>
          <strong>Plugin Manager</strong>
          <p>Manage permissions and runtime access for plugins.</p>
        </div>
      </div>
      <div class="workspace-rail-plugin-list">
        ${plugins.slice(0, 4).map((plugin) => {
          const runtime = getPluginRuntimeSummary(plugin.id);
          return `
            <article class="workspace-rail-plugin-card">
              <div class="workspace-rail-plugin-top">
                <div>
                  <strong>${plugin.name}</strong>
                  <p>${plugin.description}</p>
                </div>
                <span class="workspace-rail-status ${runtime.status}">${runtime.status}</span>
              </div>
              <div class="workspace-rail-chips">
                <span>${plugin.version}</span>
                <span>${plugin.author}</span>
                ${plugin.permissions.slice(0, 3).map((permission) => `<span>${permission}</span>`).join('')}
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>

    <section class="workspace-rail-card compact">
      <div class="workspace-rail-card-header">
        <div>
          <strong>Plugin Audit</strong>
          <p>Recent plugin activity.</p>
        </div>
      </div>
      ${auditEntries.length ? auditEntries.map((entry) => `
        <div class="workspace-rail-mini-row ${entry.status}">
          <strong>${entry.label}</strong>
          <em>${entry.pluginId}</em>
        </div>
      `).join('') : '<div class="workspace-rail-empty">No recent events.</div>'}
    </section>
  `;
}

function installWorkspacePluginRail() {
  removeLegacyFloatingPluginPanels();

  const workspace = document.querySelector('.workspace-screen');
  if (!workspace) {
    document.querySelector('.workspace-plugin-rail')?.remove();
    return;
  }

  let rail = document.querySelector<HTMLElement>('.workspace-plugin-rail');
  if (!rail) {
    rail = document.createElement('aside');
    rail.className = 'workspace-plugin-rail';
    workspace.appendChild(rail);
  }

  renderWorkspacePluginRail(rail);
}

export function startWorkspacePluginRail() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const install = () => window.setTimeout(installWorkspacePluginRail, 0);
  install();

  window.addEventListener('hashchange', install);
  window.addEventListener('vivus-plugin-approval-updated', install);
  window.addEventListener('vivus-plugin-audit-updated', install);
  window.addEventListener('vivus-plugin-runtime-state', install);

  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
