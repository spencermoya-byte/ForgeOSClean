import { getPreviewWorkspaceScope } from "./workspacePreviewScope";
import { canRunWorkspacePreview, getWorkspacePreviewRuntimePath } from "./workspacePreviewRuntimePath";

export type WorkspacePreviewLifecycleStatus = "blocked" | "stopped" | "starting" | "running" | "failed";

export type WorkspacePreviewLifecycleState = {
  status: WorkspacePreviewLifecycleStatus;
  projectPath: string;
  projectName: string;
  canRun: boolean;
  message: string;
  updatedAt: string;
};

let lifecycleState: WorkspacePreviewLifecycleState = readWorkspacePreviewLifecycleState();

function makeState(status: WorkspacePreviewLifecycleStatus, message?: string): WorkspacePreviewLifecycleState {
  const scope = getPreviewWorkspaceScope();
  const canRun = canRunWorkspacePreview();
  const projectPath = getWorkspacePreviewRuntimePath();

  return {
    status: canRun ? status : "blocked",
    projectPath,
    projectName: scope.projectName,
    canRun,
    message: canRun ? message ?? status : scope.blockedReason ?? "Select a valid workspace before starting preview.",
    updatedAt: new Date().toISOString(),
  };
}

export function readWorkspacePreviewLifecycleState() {
  const scope = getPreviewWorkspaceScope();
  const canRun = canRunWorkspacePreview();

  return {
    status: canRun ? "stopped" : "blocked",
    projectPath: getWorkspacePreviewRuntimePath(),
    projectName: scope.projectName,
    canRun,
    message: canRun ? "Preview stopped." : scope.blockedReason ?? "Select a valid workspace before starting preview.",
    updatedAt: new Date().toISOString(),
  } satisfies WorkspacePreviewLifecycleState;
}

export function getWorkspacePreviewLifecycleState() {
  return lifecycleState;
}

export function setWorkspacePreviewLifecycleStatus(status: WorkspacePreviewLifecycleStatus, message?: string) {
  lifecycleState = makeState(status, message);

  if (typeof window !== "undefined") {
    (window as Window & {
      __VIVUS_PREVIEW_LIFECYCLE__?: WorkspacePreviewLifecycleState;
    }).__VIVUS_PREVIEW_LIFECYCLE__ = lifecycleState;

    window.dispatchEvent(new CustomEvent("vivus-preview-lifecycle", { detail: lifecycleState }));
  }

  return lifecycleState;
}

export function resetWorkspacePreviewLifecycleForWorkspace() {
  lifecycleState = readWorkspacePreviewLifecycleState();

  if (typeof window !== "undefined") {
    (window as Window & {
      __VIVUS_PREVIEW_LIFECYCLE__?: WorkspacePreviewLifecycleState;
    }).__VIVUS_PREVIEW_LIFECYCLE__ = lifecycleState;

    window.dispatchEvent(new CustomEvent("vivus-preview-lifecycle", { detail: lifecycleState }));
  }

  return lifecycleState;
}
