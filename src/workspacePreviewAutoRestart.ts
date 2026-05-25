import { getWorkspacePreviewLifecycleState, setWorkspacePreviewLifecycleStatus } from "./workspacePreviewLifecycle";

let restartAttemptInFlight = false;
let restartCooldownUntil = 0;

function hasTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function tryAutoRestartPreview() {
  if (restartAttemptInFlight) return;
  if (Date.now() < restartCooldownUntil) return;

  const lifecycle = getWorkspacePreviewLifecycleState();
  if (lifecycle.status !== "failed") return;
  if (!lifecycle.canRun || !lifecycle.projectPath.trim()) return;
  if (!hasTauriRuntime()) return;

  restartAttemptInFlight = true;
  restartCooldownUntil = Date.now() + 10000;

  try {
    setWorkspacePreviewLifecycleStatus("starting", "Auto-restarting preview server...");

    const { invoke } = await import("@tauri-apps/api/core");

    await invoke("vivus_start_dev_server", {
      request: {
        projectPath: lifecycle.projectPath,
      },
    });

    setWorkspacePreviewLifecycleStatus("running", "Preview server auto-restarted.");
  } catch (error) {
    setWorkspacePreviewLifecycleStatus(
      "failed",
      error instanceof Error ? error.message : "Preview auto-restart failed."
    );
  } finally {
    restartAttemptInFlight = false;
  }
}

export function startWorkspacePreviewAutoRestart() {
  if (typeof window === "undefined") return;

  window.addEventListener("vivus-preview-crash", () => {
    void tryAutoRestartPreview();
  });

  window.addEventListener("vivus-preview-lifecycle", () => {
    void tryAutoRestartPreview();
  });
}
