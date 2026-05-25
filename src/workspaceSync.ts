import { getActiveWorkspaceRootPath } from "./stores/workspaceStore";

export function getWorkspaceProjectPath() {
  return getActiveWorkspaceRootPath();
}

export function requireWorkspaceProjectPath() {
  const projectPath = getWorkspaceProjectPath();
  if (!projectPath) {
    throw new Error("No active workspace selected. Open or create a project before building.");
  }
  return projectPath;
}

export function syncWorkspaceFile(relativePath: string) {
  if (typeof window === "undefined" || !relativePath.trim()) return;

  window.dispatchEvent(new Event("vivus-files-refresh"));
  window.dispatchEvent(new Event("vivus-preview-refresh"));
  window.dispatchEvent(new CustomEvent("vivus-open-file", { detail: { relativePath } }));
}
