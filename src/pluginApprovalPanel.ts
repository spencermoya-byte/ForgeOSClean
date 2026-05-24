import { listPluginApprovals, resolvePluginApproval } from './pluginApprovalQueue';

function renderApprovalPanel(container: HTMLElement) {
  const approvals = listPluginApprovals();
  const pending = approvals.filter((approval) => approval.status === 'pending');

  container.innerHTML = `
    <div class="plugin-approval-header">
      <strong>Plugin Approvals</strong>
      <p>${pending.length} pending permission request${pending.length === 1 ? '' : 's'}.</p>
    </div>
    <div class="plugin-approval-list">
      ${approvals.length ? approvals.map((approval) => `
        <div class="plugin-approval-card ${approval.status}" data-approval-id="${approval.id}">
          <div>
            <strong>${approval.permission}</strong>
            <p>${approval.reason}</p>
            <span>${approval.pluginId}</span>
          </div>
          <em>${approval.status}</em>
          ${approval.status === 'pending' ? `
            <div class="plugin-approval-actions">
              <button type="button" data-approval-action="approved">Approve</button>
              <button type="button" data-approval-action="denied">Deny</button>
            </div>
          ` : ''}
        </div>
      `).join('') : '<div class="plugin-approval-empty">No plugin approval requests yet.</div>'}
    </div>
  `;

  container.querySelectorAll<HTMLButtonElement>('[data-approval-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest<HTMLElement>('[data-approval-id]');
      const requestId = card?.dataset.approvalId;
      const action = button.dataset.approvalAction;
      if (!requestId || (action !== 'approved' && action !== 'denied')) return;

      resolvePluginApproval(requestId, action);
      renderApprovalPanel(container);
    });
  });
}

function installPluginApprovalPanel() {
  const dock = document.querySelector('.workspace-dock');
  if (!dock || document.querySelector('.plugin-approval-panel')) return;

  const panel = document.createElement('div');
  panel.className = 'plugin-approval-panel';
  renderApprovalPanel(panel);
  document.body.appendChild(panel);

  window.addEventListener('vivus-plugin-approval-updated', () => renderApprovalPanel(panel));
}

export function startPluginApprovalPanel() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const install = () => window.setTimeout(installPluginApprovalPanel, 0);
  install();

  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
