import { listVivusPlugins } from './pluginRegistry';
import { getPluginRuntimeSummary } from './pluginRuntimeSummary';
import { listPluginApprovals } from './pluginApprovalQueue';
import { listPluginAuditTrail } from './pluginAuditTrail';

function isWorkspaceRoute() {
  return window.location.hash.includes('workspace');
}

function renderUtilityRail(container: HTMLElement) {
  const plugins = listVivusPlugins();
  const approvals = listPluginApprovals();
  const pendingApprovals = approvals.filter((approval) => approval.status === 'pending');
  const auditEvents = listPluginAuditTrail().slice(0, 4);

  container.innerHTML = `
    <section class="workspace-utility-card plugin-approvals-card">
      <div class="utility-card-header">
        <div>
          <strong>Plugin Approvals</strong>
          <p>Review permission requests before risky plugin actions run.</p>
        </div>
        <span>${pendingApprovals.length} Pending</span>
      </div>
      ${pendingApprovals.length ? pendingApprovals.slice(0, 3).map((approval) => `
        <div class="utility-row">
          <strong>${approval.permission}</strong>
          <p>${approval.reason}</p>
        </div>
      `).join('') : '<p class="utility-empty">No pending permission requests.</p>'}
    </section>

    <section class="workspace-utility-card plugin-manager-card">
      <div class="utility-card-header">
        <div>
          <strong>Plugin Manager</strong>
          <p>Runtime status and permissions for active plugins.</p>
        </div>
      </div>
      <div class="utility-plugin-list">
        ${plugins.slice(0, 4).map((plugin) => {
          const runtime = getPluginRuntimeSummary(plugin.id);
          return `
            <div class="utility-plugin-row">
              <div>
                <strong>${plugin.name}</strong>
                <p>${plugin.description}</p>
              </div>
              <span class="runtime-pill ${runtime.status}">${runtime.status}</span>
            </div>
          `;
        }).join('')}
      </div>
    </section>

    <section class="workspace-utility-card plugin-audit-card">
      <div class="utility-card-header">
        <div>
          <strong>Plugin Audit</strong>
          <p>Recent plugin events and security decisions.</p>
        </div>
      </div>
      ${auditEvents.length ? auditEvents.map((entry) => `
        <div class="utility-row ${entry.status}">
          <strong>${entry.label}</strong>
          <p>${entry.detail}</p>
        </div>
      `).join('') : '<p class="utility-empty">No recent events.</p>'}
    </section>
  `;
}

function ensureUtilityRail() {
  const existing = document.querySelector<HTMLElement>('.workspace-utility-rail');
  if (!isWorkspaceRoute()) {
    existing?.remove();
    return;
  }

  const workspace = document.querySelector('.builder-workspace') ?? document.querySelector('.workspace-content');
  if (!workspace) return;

  if (existing) {
    renderUtilityRail(existing);
    return;
  }

  const rail = document.createElement('aside');
  rail.className = 'workspace-utility-rail';
  renderUtilityRail(rail);
  workspace.appendChild(rail);
}

export function startWorkspaceUtilityRail() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const install = () => window.setTimeout(ensureUtilityRail, 0);
  install();
  window.addEventListener('hashchange', install);
  window.addEventListener('vivus-plugin-approval-updated', install);
  window.addEventListener('vivus-plugin-audit-updated', install);
  window.addEventListener('vivus-plugin-runtime-state', install);

  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
