const PROJECT_PATH_KEY = "vivus.previewProjectPath.v1";
const DEFAULT_PROJECT_PATH = "C:/ForgeOSClean";

export function getWorkspaceProjectPath() {
  if (typeof window === "undefined") return DEFAULT_PROJECT_PATH;
  return window.localStorage.getItem(PROJECT_PATH_KEY)?.trim() || DEFAULT_PROJECT_PATH;
}

export function syncWorkspaceFile(relativePath: string) {
  if (typeof window === "undefined" || !relativePath.trim()) return;

  window.dispatchEvent(new Event("vivus-files-refresh"));
  window.dispatchEvent(new Event("vivus-preview-refresh"));
  window.dispatchEvent(new CustomEvent("vivus-open-file", { detail: { relativePath } }));
}
