import { recoverPreview } from "./previewRecoveryCoordinator";
import { updatePreviewHealth } from "./previewHealthState";

export type PreviewGuardResult = {
  ok: boolean;
  recovered: boolean;
  summary: string;
};

const BLANK_SCREEN_SELECTORS = [
  "#root",
  "[data-preview-root]",
  "main"
];

export function guardPreviewAgainstBlankScreen(
  projectPath: string,
  html?: string
): PreviewGuardResult {
  const normalized = (html ?? "").trim();

  const looksBlank =
    !normalized ||
    normalized.length < 40 ||
    !BLANK_SCREEN_SELECTORS.some((selector) =>
      normalized.includes(selector.replace("#", ""))
    );

  if (!looksBlank) {
    updatePreviewHealth(projectPath, {
      status: "healthy",
      lastHealthyAt: new Date().toISOString(),
      failureReason: undefined,
    });

    return {
      ok: true,
      recovered: false,
      summary: "Preview healthy.",
    };
  }

  updatePreviewHealth(projectPath, {
    status: "degraded",
    failureReason: "Blank preview detected.",
    lastFailureAt: new Date().toISOString(),
  });

  const recovery = recoverPreview(
    projectPath,
    "Blank preview detected"
  );

  return {
    ok: recovery.ok,
    recovered: recovery.restarted,
    summary: recovery.summary,
  };
}
