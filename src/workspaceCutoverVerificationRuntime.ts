import { getWorkspaceCutoverStatus } from './workspaceCutoverStatus';

function verifyWorkspaceCutover() {
  if (typeof window === 'undefined') return;

  const status = getWorkspaceCutoverStatus();

  (window as Window & {
    __VIVUS_WORKSPACE_CUTOVER_VERIFIED__?: boolean;
  }).__VIVUS_WORKSPACE_CUTOVER_VERIFIED__ = Boolean(
    status.cutoverEnabled &&
    status.appStateDisabled &&
    status.workspaceOwned
  );
}

export function startWorkspaceCutoverVerificationRuntime() {
  if (typeof window === 'undefined') return;

  verifyWorkspaceCutover();
  window.addEventListener('storage', verifyWorkspaceCutover);
}
