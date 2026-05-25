import { verifyWorkspaceRuntimeReadiness } from './workspaceRuntimeReadinessVerifier';

export function bootstrapWorkspaceRuntime() {
  if (typeof window === 'undefined') return;

  const readiness = verifyWorkspaceRuntimeReadiness();

  (window as Window & {
    __VIVUS_BOOTSTRAP_READY__?: boolean;
    __VIVUS_BOOTSTRAP_STATE__?: typeof readiness;
  }).__VIVUS_BOOTSTRAP_READY__ = readiness.ready;

  (window as Window & {
    __VIVUS_BOOTSTRAP_STATE__?: typeof readiness;
  }).__VIVUS_BOOTSTRAP_STATE__ = readiness;
}
