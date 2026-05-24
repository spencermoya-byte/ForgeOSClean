import { createExecutionPolicyReport, defaultExecutionPermissions } from './executionPolicy';
import type { AutonomyMode } from './autonomyPolicy';

const MODE_KEY = 'vivus.autonomyMode.v1';
const modes: AutonomyMode[] = ['light', 'medium', 'full'];

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

function renderPolicyPanel(container: HTMLElement) {
  const mode = readMode();
  const report = createExecutionPolicyReport(mode, defaultExecutionPermissions);

  container.innerHTML = `
    <strong>Execution policy</strong>
    <p>Autonomy and permission rules are now applied before build execution preview.</p>
    <div class="execution-policy-modes">
      ${modes.map((item) => `<button type="button" data-autonomy-mode="${item}" class="${item === mode ? 'active' : ''}">${item}</button>`).join('')}
    </div>
    <pre class="execution-policy-report">${report.summary}</pre>
  `;

  container.querySelectorAll<HTMLButtonElement>('[data-autonomy-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.autonomyMode as AutonomyMode;
      writeMode(next);
      renderPolicyPanel(container);
      window.dispatchEvent(new CustomEvent('vivus-execution-policy-updated', { detail: createExecutionPolicyReport(next, defaultExecutionPermissions) }));
    });
  });
}

function installExecutionPolicyPanel() {
  const workflow = document.querySelector('.builder-workflow-panel');
  const actions = document.querySelector('.builder-workflow-actions');
  if (!workflow || !actions || document.querySelector('.execution-policy-panel')) return;

  const panel = document.createElement('div');
  panel.className = 'builder-plan-section execution-policy-panel';
  renderPolicyPanel(panel);
  actions.parentElement?.insertBefore(panel, actions);
}

export function startExecutionPolicyInstaller() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const install = () => window.setTimeout(installExecutionPolicyPanel, 0);
  install();
  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
