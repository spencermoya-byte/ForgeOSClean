import { addPreviewDiagnostic } from "./previewDiagnosticsState";
import { recoverPreview } from "./previewRecoveryCoordinator";
import { getPreviewHealth, updatePreviewHealth } from "./previewHealthState";

export type PreviewRestartResult = {
  ok: boolean;
  restarted: boolean;
  summary: string;
};

export async function restartPreviewFlow(
  projectPath: string,
  reason: string
): Promise<PreviewRestartResult> {
  const health = getPreviewHealth(projectPath);

  updatePreviewHealth(projectPath, {
    status: "recovering",
    failureReason: reason,
    lastFailureAt: new Date().toISOString(),
  });

  addPreviewDiagnostic(
    projectPath,
    "warning",
    "recovery",
    `Preview restart requested: ${reason}`
  );

  const recovery = recoverPreview(projectPath, reason);

  if (!recovery.ok) {
    updatePreviewHealth(projectPath, {
      status: "failed",
    });

    addPreviewDiagnostic(
      projectPath,
      "error",
      "recovery",
      `Preview restart failed after ${health?.restartCount ?? 0} attempt(s).`
    );

    return {
      ok: false,
      restarted: false,
      summary: recovery.summary,
    };
  }

  updatePreviewHealth(projectPath, {
    status: "starting",
    lastRecoveryAt: new Date().toISOString(),
  });

  addPreviewDiagnostic(
    projectPath,
    "info",
    "recovery",
    "Preview restart flow completed."
  );

  return {
    ok: true,
    restarted: true,
    summary: recovery.summary,
  };
}
