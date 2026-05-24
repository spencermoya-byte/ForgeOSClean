import { createExecutionPolicyReport, defaultExecutionPermissions, type ExecutionPolicyReport } from './executionPolicy';
import type { AutonomyMode } from './autonomyPolicy';
import { recordExecutionTransparencyEvent, recordPolicyTransparency } from './executionTransparencyBridge';

const MODE_KEY = 'vivus.autonomyMode.v1';
const POLICY_SNAPSHOT_KEY = 'vivus.executionPolicySnapshot.v1';
const modes: AutonomyMode[] = ['light', 'medium', 'full'];
let lastPublishedSignature = '';

function readMode(): AutonomyMode {
  try {
    const raw = window.localStorage.getItem(MODE_KEY) as AutonomyMode | null;
    return raw && modes.includes(raw) ? raw : 'medium';
  } catch {
    return 'medium';
  }
}

function writeMode(mode: AutonomyMode) {
  try {
    window.localStorage.setItem(MODE_KEY, mode);
  } catch {}
}

function persistPolicySnapshot(report: ExecutionPolicyReport) {
  try {
    window.localStorage.setItem(POLICY_SNAPSHOT_KEY, JSON.stringify(report));
  } catch {}
}

function publishPolicy(report: ExecutionPolicyReport, forceTransparency = false) {
  persistPolicySnapshot(report);
  window.dispatchEvent(new CustomEvent('vivus-execution-policy-updated', { detail: report }));

  const signature = `${report.autonomyMode}:${report.allowed.length}:${report.approvalRequired.length}:${report.blocked.length}`;
  if (forceTransparency || signature !== lastPublishedSignature) {
    lastPublishedSignature = signature;
    recordPolicyTransparency(report);
  }
}

function getCurrentReport() {
  return createExecutionPolicyReport(readMode(), defaultExecutionPermissions);
}

function ensurePreviewPolicyNotice(report: ExecutionPolicyReport) {
  const actions = document.querySelector('.builder-workflow-actions');
  if (!actions?.parentElement) return;

  const existing = document.querySelector('.execution-policy-preview-notice');
  existing?.remove();

  const notice = document.createElement('div');
  notice.className = 'builder-plan-section execution-policy-preview-notice';
  notice.innerHTML = `
    <strong>Execution preview policy snapshot</strong>
    <p>The next execution preview will use the selected autonomy and permission policy.</p>
    <pre class="execution-policy-report">${report.summary}</pre>
  `;
  actions.parentElement.insertBefore(notice, actions);
}

function bindExecutionPreviewButton() {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.builder-workflow-actions button'));
  const previewButton = buttons.find((button) => button.textContent?.toLowerCase().includes('execution preview'));
  if (!previewButton || previewButton.dataset.executionPolicyBound === 'true') return;

  previewButton.dataset.executionPolicyBound = 'true';
  previewButton.addEventListener('click', () => {
    const report = getCurrentReport();
    publishPolicy(report, true);
    recordExecutionTransparencyEvent('Execution preview started', `Preview started with ${report.autonomyMode} autonomy.`, 'active');
    ensurePreviewPolicyNotice(report);
  }, { capture: true });
}

function renderPolicyPanel(container: HTMLElement) {
  const report = getCurrentReport();
  publishPolicy(report);

  container.innerHTML = `
    <strong>Execution policy</strong>
    <p>Autonomy and permission rules are now applied before build execution preview.</p>
    <div class="execution-policy-modes">
      ${modes.map((item) => `<button type="button" data-autonomy-mode="${item}" class="${item === report.autonomyMode ? 'active' : ''}">${item}</button>`).join('')}
    </div>
    <pre class="execution-policy-report">${report.summary}</pre>
  `;

  container.querySelectorAll<HTMLButtonElement>('[data-autonomy-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.autonomyMode as AutonomyMode;
      writeMode(next);
      renderPolicyPanel(container);
      const nextReport = getCurrentReport();
      publishPolicy(nextReport, true);
      ensurePreviewPolicyNotice(nextReport);
    });
  });
}

function installExecutionPolicyPanel() {
  const workflow = document.querySelector('.builder-workflow-panel');
  const actions = document.querySelector('.builder-workflow-actions');
  if (!workflow || !actions) return;

  let panel = document.querySelector<HTMLElement>('.execution-policy-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'builder-plan-section execution-policy-panel';
    actions.parentElement?.insertBefore(panel, actions);
  }

  if (panel.dataset.rendered !== readMode()) {
    panel.dataset.rendered = readMode();
    renderPolicyPanel(panel);
  }

  bindExecutionPreviewButton();
}

export function startExecutionPolicyInstaller() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const install = () => window.setTimeout(installExecutionPolicyPanel, 0);
  install();
  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
