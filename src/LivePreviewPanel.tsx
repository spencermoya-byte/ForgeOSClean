import React from "react";
import "./LivePreviewPanel.css";
import { ExternalLink, Monitor, Play, RefreshCw } from "lucide-react";

type PreviewStatus = "stopped" | "starting" | "running" | "failed";

type LivePreviewStartResponse = {
  url?: string;
  pid?: number;
  failure_reason?: string;
  failureReason?: string;
  ok?: boolean;
};

const DEFAULT_PREVIEW_URL = "http://127.0.0.1:1420";

function hasTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function normalizePreviewResponse(response: LivePreviewStartResponse | null | undefined) {
  const failureReason = response?.failure_reason ?? response?.failureReason ?? null;
  const url = typeof response?.url === "string" && response.url.trim() ? response.url.trim() : DEFAULT_PREVIEW_URL;
  const pid = typeof response?.pid === "number" ? response.pid : null;

  return {
    ok: !failureReason,
    url,
    pid,
    failureReason,
  };
}

export function LivePreviewPanel() {
  const [previewUrl, setPreviewUrl] = React.useState("");
  const [previewStatus, setPreviewStatus] = React.useState<PreviewStatus>("stopped");
  const [previewPid, setPreviewPid] = React.useState<number | null>(null);
  const [failureReason, setFailureReason] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);

  const isRunning = previewStatus === "running" && Boolean(previewUrl);
  const iframeUrl = isRunning ? `${previewUrl}${previewUrl.includes("?") ? "&" : "?"}vivus_refresh=${refreshKey}` : "";

  const refreshPreview = React.useCallback(() => {
    if (!previewUrl) return;
    setRefreshKey((current) => current + 1);
  }, [previewUrl]);

  React.useEffect(() => {
    const handleRefresh = () => refreshPreview();
    window.addEventListener("vivus-preview-refresh", handleRefresh);
    return () => window.removeEventListener("vivus-preview-refresh", handleRefresh);
  }, [refreshPreview]);

  async function startLivePreview() {
    if (previewStatus === "starting") return;
    setPreviewStatus("starting");
    setFailureReason("");

    if (!hasTauriRuntime()) {
      setPreviewUrl(DEFAULT_PREVIEW_URL);
      setPreviewPid(null);
      setPreviewStatus("running");
      setRefreshKey((current) => current + 1);
      return;
    }

    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const response = await invoke<LivePreviewStartResponse>("vivus_start_dev_server");
      const normalized = normalizePreviewResponse(response);

      if (!normalized.ok) {
        setPreviewStatus("failed");
        setFailureReason(normalized.failureReason ?? "Preview server failed to start.");
        return;
      }

      setPreviewUrl(normalized.url);
      setPreviewPid(normalized.pid);
      setPreviewStatus("running");
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setPreviewStatus("failed");
      setFailureReason(error instanceof Error ? error.message : String(error));
    }
  }

  function openExternal() {
    if (!previewUrl) return;
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="workspace-content tool-panel-screen">
      <div className="tool-panel-card preview-panel-card live-preview-panel">
        <div className="live-preview-header">
          <div className="tool-panel-heading">
            <Monitor size={18} />
            <div>
              <h2>Live Preview</h2>
              <p>Embedded localhost preview for the current Vivus project.</p>
            </div>
          </div>
          <div className={`live-preview-status ${previewStatus}`}>
            <span />
            {previewStatus}
          </div>
        </div>

        <div className="live-preview-actions">
          <button type="button" onClick={startLivePreview} disabled={previewStatus === "starting"}>
            <Play size={15} />
            {previewStatus === "starting" ? "Starting..." : isRunning ? "Restart Preview" : "Start Preview"}
          </button>
          <button type="button" onClick={refreshPreview} disabled={!isRunning}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <button type="button" onClick={openExternal} disabled={!previewUrl}>
            <ExternalLink size={15} />
            Open External
          </button>
        </div>

        <div className="live-preview-meta">
          <span>{previewUrl || "Preview not started"}</span>
          {previewPid !== null && <em>PID {previewPid}</em>}
        </div>

        <div className="live-preview-frame-shell">
          {isRunning ? (
            <iframe
              key={iframeUrl}
              title="Vivus embedded live preview"
              src={iframeUrl}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          ) : (
            <div className="live-preview-empty">
              <div className="preview-window">
                <div className="preview-window-top" />
                <div className="preview-window-body">
                  {previewStatus === "failed" ? failureReason || "Preview failed to start." : "Preview not started."}
                </div>
              </div>
              <p>{previewStatus === "failed" ? "Fix the dev server issue, then start preview again." : "Start the local dev server to load http://127.0.0.1:1420 here."}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
