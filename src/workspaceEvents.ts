export const VIVUS_WORKSPACE_CHANGED = "vivus-workspace-changed";
export const VIVUS_FILES_REFRESH = "vivus-files-refresh";
export const VIVUS_PREVIEW_REFRESH = "vivus-preview-refresh";

export function emitWorkspaceChanged(detail?: unknown) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(VIVUS_WORKSPACE_CHANGED, { detail }));
}

export function emitWorkspaceRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(VIVUS_FILES_REFRESH));
  window.dispatchEvent(new Event(VIVUS_PREVIEW_REFRESH));
}

export function subscribeWorkspaceChanged(callback: EventListener) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(VIVUS_WORKSPACE_CHANGED, callback);
  return () => window.removeEventListener(VIVUS_WORKSPACE_CHANGED, callback);
}
