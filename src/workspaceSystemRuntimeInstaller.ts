import { getWorkspaceOwnedRuntimeStatus } from "./workspaceOwnedRuntimeStatus";
import { subscribeWorkspaceChanged } from "./workspaceEvents";

type RuntimePayload = {
  projectId: string;
  projectName: string;
  rootPath: string;
};

function buildRuntimePayload(): RuntimePayload {
  const runtime = getWorkspaceOwnedRuntimeStatus();

  return {
    projectId: runtime.activeProjectId,
    projectName: runtime.activeProjectName,
    rootPath: runtime.activeProjectRoot,
  };
}

function syncWorkspaceSystems() {
  if (typeof window === "undefined") return;

  const payload = buildRuntimePayload();

  const target = window as Window & {
    __VIVUS_SYSTEM_RUNTIME__?: RuntimePayload;
    __VIVUS_BUILDER_WORKSPACE__?: RuntimePayload;
    __VIVUS_PREVIEW_WORKSPACE__?: RuntimePayload;
    __VIVUS_EXECUTION_WORKSPACE__?: RuntimePayload;
    __VIVUS_FILES_WORKSPACE__?: RuntimePayload;
    __VIVUS_TERMINAL_WORKSPACE__?: RuntimePayload;
  };

  target.__VIVUS_SYSTEM_RUNTIME__ = payload;
  target.__VIVUS_BUILDER_WORKSPACE__ = payload;
  target.__VIVUS_PREVIEW_WORKSPACE__ = payload;
  target.__VIVUS_EXECUTION_WORKSPACE__ = payload;
  target.__VIVUS_FILES_WORKSPACE__ = payload;
  target.__VIVUS_TERMINAL_WORKSPACE__ = payload;
}

export function startWorkspaceSystemRuntimeInstaller() {
  if (typeof window === "undefined") return;

  syncWorkspaceSystems();
  subscribeWorkspaceChanged(syncWorkspaceSystems);
}
