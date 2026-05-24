import { activateVivusWorkspace, listVivusWorkspaces, upsertVivusWorkspace } from './workspaceRegistry';

const DEFAULT_PROJECT_PATH = 'C:/ForgeOSClean';

function ensureDefaultWorkspace() {
  const existing = listVivusWorkspaces();
  if (existing.length) return existing[0];

  return upsertVivusWorkspace({
    id: 'workspace-forgeosclean',
    name: 'ForgeOSClean',
    projectPath: DEFAULT_PROJECT_PATH,
    description: 'Primary local Vivus development workspace.',
    status: 'active',
  });
}

function renderWorkspaceSwitcher(container: HTMLElement) {
  ensureDefaultWorkspace();
  const workspaces = listVivusWorkspaces().filter((workspace) => workspace.status !== 'archived').slice(0, 6);

  container.innerHTML = `
    <div class="workspace-switcher-header">
      <strong>Workspaces</strong>
      <p>Recent local projects and active workspace context.</p>
    </div>
    <div class="workspace-switcher-list">
      ${workspaces.map((workspace) => `
        <button type="button" class="workspace-switcher-card" data-workspace-id="${workspace.id}">
          <strong>${workspace.name}</strong>
          <span>${workspace.projectPath}</span>
          <em>${workspace.status}</em>
        </button>
      `).join('')}
    </div>
  `;

  container.querySelectorAll<HTMLButtonElement>('[data-workspace-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const workspaceId = button.dataset.workspaceId;
      if (!workspaceId) return;
      const workspace = activateVivusWorkspace(workspaceId);
      if (!workspace) return;
      window.localStorage.setItem('vivus.previewProjectPath.v1', workspace.projectPath);
      renderWorkspaceSwitcher(container);
    });
  });
}

function installWorkspaceSwitcher() {
  const workspace = document.querySelector('.workspace-content');
  if (!workspace || document.querySelector('.workspace-switcher-panel')) return;

  const panel = document.createElement('aside');
  panel.className = 'workspace-switcher-panel';
  renderWorkspaceSwitcher(panel);
  workspace.appendChild(panel);
}

export function startWorkspaceSwitcherInstaller() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const install = () => window.setTimeout(installWorkspaceSwitcher, 0);
  install();
  window.addEventListener('vivus-workspace-registry-updated', install);
  window.addEventListener('vivus-active-workspace-updated', install);

  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
