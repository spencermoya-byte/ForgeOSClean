import { subscribeWorkspaceChanged } from './workspaceEvents';
import { getWorkspaceRuntimeHealth } from './workspaceRuntimeHealth';

function syncWorkspaceHealth() {
  if (typeof window === 'undefined') return;

  (window as Window & {
    __VIVUS_WORKSPACE_HEALTH__?: ReturnType<typeof getWorkspaceRuntimeHealth>;
  }).__VIVUS_WORKSPACE_HEALTH__ = getWorkspaceRuntimeHealth();
}

export function startWorkspaceRuntimeHealthInstaller() {
  if (typeof window === 'undefined') return;

  syncWorkspaceHealth();
  subscribeWorkspaceChanged(syncWorkspaceHealth);
}
