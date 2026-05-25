import { reconcileWorkspacePreviewCrashState } from "./workspacePreviewCrashRecovery";
import { getWorkspacePreviewLifecycleState } from "./workspacePreviewLifecycle";

type PreviewStatusResponse = {
  status?: string;
  blockedReason?: string;
  failureReason?: string;
  failure_reason?: string;
};

let monitorInterval: number | null = null;

function hasTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function responseReason(response: PreviewStatusResponse | null | undefined) {
  return response?.blockedReason ?? response?.failureReason ?? response?.failure_reason ?? "Preview server stopped unexpectedly.";
}

async function checkPreviewServerHealth() {
  const lifecycle = getWorkspacePreviewLifecycleState();

  if (lifecycle.status !== "running" && lifecycle.status !== "starting") return;
  if (!hasTauriRuntime()) return;

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const response = await invoke<PreviewStatusResponse>("vivus_dev_server_status");
    const serverIsRunning = response?.status === "running";

    reconcileWorkspacePreviewCrashState(serverIsRunning, serverIsRunning ? undefined : responseReason(response));
  } catch (error) {
    reconcileWorkspacePreviewCrashState(false, error instanceof Error ? error.message : "Preview server health check failed.");
  }
}

export function startWorkspacePreviewCrashMonitor() {
  if (typeof window === "undefined") return;
  if (monitorInterval !== null) return;

  monitorInterval = window.setInterval(() => {
    void checkPreviewServerHealth();
  }, 3000);

  window.addEventListener("vivus-preview-lifecycle", () => {
    void checkPreviewServerHealth();
  });
}
