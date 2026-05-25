import { subscribeWorkspaceChanged } from './workspaceEvents';
import { verifyWorkspaceRuntimeReadiness } from './workspaceRuntimeReadinessVerifier';

function syncWorkspaceReadiness() {
  if (typeof window === 'undefined') return;

  (window as Window & {
    __VIVUS_WORKSPACE_RUNTIME_READY__?: ReturnType<typeof verifyWorkspaceRuntimeReadiness>;
  }).__VIVUS_WORKSPACE_RUNTIME_READY__ = verifyWorkspaceRuntimeReadiness();
}

export function startWorkspaceRuntimeReadinessInstaller() {
  if (typeof window === 'undefined') return;

  syncWorkspaceReadiness();
  subscribeWorkspaceChanged(syncWorkspaceReadiness);
}
