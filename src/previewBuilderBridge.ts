import { updatePreviewHealth } from "./previewHealthState";
import { guardPreviewAgainstBlankScreen } from "./previewBlankScreenGuard";

export type PreviewBuilderBridgeResult = {
  ok: boolean;
  previewRefreshed: boolean;
  summary: string;
};

export function syncBuilderToPreview(
  projectPath: string,
  verificationPassed: boolean,
  previewHtml?: string
): PreviewBuilderBridgeResult {
  updatePreviewHealth(projectPath, {
    status: verificationPassed ? "starting" : "degraded",
    updatedAt: new Date().toISOString(),
  });

  if (!verificationPassed) {
    return {
      ok: false,
      previewRefreshed: false,
      summary: "Builder verification failed. Preview refresh blocked.",
    };
  }

  const previewCheck = guardPreviewAgainstBlankScreen(
    projectPath,
    previewHtml
  );

  updatePreviewHealth(projectPath, {
    status: previewCheck.ok ? "healthy" : "recovering",
    url: "http://localhost:1420",
    lastHealthyAt: previewCheck.ok
      ? new Date().toISOString()
      : undefined,
  });

  return {
    ok: previewCheck.ok,
    previewRefreshed: true,
    summary: previewCheck.summary,
  };
}
