import { getPreviewHealth, updatePreviewHealth } from "./previewHealthState";

export type PreviewRecoveryResult = {
  ok: boolean;
  restarted: boolean;
  summary: string;
};

const MAX_RECOVERY_ATTEMPTS = 3;

export function recoverPreview(
  projectPath: string,
  reason: string
): PreviewRecoveryResult {
  const current = getPreviewHealth(projectPath);

  const restartCount = (current?.restartCount ?? 0) + 1;

  updatePreviewHealth(projectPath, {
    status:
      restartCount > MAX_RECOVERY_ATTEMPTS
        ? "failed"
        : "recovering",
    restartCount,
    failureReason: reason,
    lastFailureAt: new Date().toISOString(),
  });

  if (restartCount > MAX_RECOVERY_ATTEMPTS) {
    return {
      ok: false,
      restarted: false,
      summary: "Preview recovery limit exceeded.",
    };
  }

  updatePreviewHealth(projectPath, {
    status: "starting",
    lastRecoveryAt: new Date().toISOString(),
  });

  return {
    ok: true,
    restarted: true,
    summary: `Preview recovery started (${restartCount}/${MAX_RECOVERY_ATTEMPTS}).`,
  };
}
