import { getPreviewWorkspaceScope } from "./workspacePreviewScope";

const DEFAULT_PROJECT_PATH = "C:/ForgeOSClean";
const PREVIEW_PROJECT_PATH_KEY = "vivus.previewProjectPath.v1";

function readFallbackPreviewPath() {
  try {
    return window.localStorage.getItem(PREVIEW_PROJECT_PATH_KEY)?.trim() || DEFAULT_PROJECT_PATH;
  } catch {
    return DEFAULT_PROJECT_PATH;
  }
}

export function getWorkspacePreviewRuntimePath() {
  const scope = getPreviewWorkspaceScope();

  if (scope.enabled && scope.projectPath.trim()) {
    return scope.projectPath.trim();
  }

  return readFallbackPreviewPath();
}

export function persistWorkspacePreviewRuntimePath(path: string) {
  try {
    window.localStorage.setItem(PREVIEW_PROJECT_PATH_KEY, path.trim() || DEFAULT_PROJECT_PATH);
  } catch {}
}

export function canRunWorkspacePreview() {
  const scope = getPreviewWorkspaceScope();
  return scope.enabled && scope.refreshAllowed && Boolean(scope.projectPath.trim());
}

export function getWorkspacePreviewBlockedReason() {
  const scope = getPreviewWorkspaceScope();
  return scope.blockedReason ?? "Select a valid workspace before starting preview.";
}
