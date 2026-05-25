import "./LivePreviewPanel.css";
import {
  canRunWorkspacePreview,
  getWorkspacePreviewBlockedReason,
  getWorkspacePreviewRuntimePath,
  persistWorkspacePreviewRuntimePath,
} from "./workspacePreviewRuntimePath";

type PreviewStatus = "stopped" | "starting" | "running" | "failed";

type LivePreviewResponse = {
  ok?: boolean;
  url?: string;
  pid?: number;
  status?: string;
  projectPath?: string;
  blockedReason?: string;
  failure_reason?: string;
  failureReason?: string;
};

const DEFAULT_PREVIEW_URL = "http://127.0.0.1:1420";

let previewUrl = "";
let previewPid: number | null = null;
let previewStatus: PreviewStatus = "stopped";
let failureReason = "";
let refreshKey = 0;
let mountedPanel: HTMLElement | null = null;
let statusPollInterval: number | null = null;

function hasTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  }[char] ?? char));
}

function getPreviewProjectPath() {
  return getWorkspacePreviewRuntimePath();
}

function setPreviewProjectPath(path: string) {
  persistWorkspacePreviewRuntimePath(path);
}

function normalizeResponse(response: LivePreviewResponse | null | undefined) {
  const failure = response?.blockedReason ?? response?.failureReason ?? response?.failure_reason ?? "";

  return {
    ok: Boolean(response?.ok ?? !failure),
    url: response?.url?.trim() || DEFAULT_PREVIEW_URL,
    pid: typeof response?.pid === "number" ? response.pid : null,
    status: response?.status ?? "stopped",
    failureReason: failure,
  };
}

function setStatus(status: PreviewStatus, reason = "") {
  previewStatus = status;
  failureReason = reason;
  renderMountedPanel();
}

function refreshPreview() {
  if (!previewUrl) return;
  refreshKey += 1;
  renderMountedPanel();
}

async function syncPreviewStatus() {
  if (!hasTauriRuntime()) return;

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const response = await invoke<LivePreviewResponse>("vivus_dev_server_status");
    const normalized = normalizeResponse(response);

    if (normalized.status === "running") {
      previewUrl = normalized.url;
      previewPid = normalized.pid;
      previewStatus = "running";
    } else if (previewStatus !== "starting") {
      previewPid = null;
      previewStatus = "stopped";
    }

    renderMountedPanel();
  } catch {
    // Silent status failures.
  }
}

function startStatusPolling() {
  if (statusPollInterval !== null) return;

  statusPollInterval = window.setInterval(() => {
    void syncPreviewStatus();
  }, 2500);
}

async function startLivePreview() {
  if (previewStatus === "starting") return;

  if (!canRunWorkspacePreview()) {
    setStatus("failed", getWorkspacePreviewBlockedReason());
    return;
  }

  const projectPath = getPreviewProjectPath();
  setStatus("starting");

  if (!hasTauriRuntime()) {
    previewUrl = DEFAULT_PREVIEW_URL;
    previewPid = null;
    refreshKey += 1;
    setStatus("running");
    return;
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");

    const response = await invoke<LivePreviewResponse>("vivus_start_dev_server", {
      request: { projectPath },
    });

    const normalized = normalizeResponse(response);

    if (!normalized.ok) {
      setStatus("failed", normalized.failureReason || "Preview server failed to start.");
      return;
    }

    previewUrl = normalized.url;
    previewPid = normalized.pid;
    refreshKey += 1;
    setStatus(normalized.status === "starting" ? "starting" : "running");

    window.setTimeout(() => {
      void syncPreviewStatus();
    }, 2500);
  } catch (error) {
    setStatus("failed", error instanceof Error ? error.message : String(error));
  }
}

async function stopLivePreview() {
  if (!hasTauriRuntime()) {
    previewStatus = "stopped";
    previewPid = null;
    renderMountedPanel();
    return;
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("vivus_stop_dev_server");

    previewStatus = "stopped";
    previewPid = null;
    failureReason = "";
    renderMountedPanel();
  } catch (error) {
    setStatus("failed", error instanceof Error ? error.message : String(error));
  }
}

function openExternalPreview() {
  if (!previewUrl) return;
  window.open(previewUrl, "_blank", "noopener,noreferrer");
}

function previewFrameUrl() {
  if (!previewUrl || previewStatus !== "running") return "";
  return `${previewUrl}${previewUrl.includes("?") ? "&" : "?"}vivus_refresh=${refreshKey}`;
}

function bindPreviewControls() {
  mountedPanel?.querySelector<HTMLInputElement>('[data-preview-path-input]')?.addEventListener("input", (event) => {
    setPreviewProjectPath((event.currentTarget as HTMLInputElement).value);
  });

  mountedPanel?.querySelector('[data-preview-action="start"]')?.addEventListener("click", startLivePreview);
  mountedPanel?.querySelector('[data-preview-action="stop"]')?.addEventListener("click", stopLivePreview);
  mountedPanel?.querySelector('[data-preview-action="refresh"]')?.addEventListener("click", refreshPreview);
  mountedPanel?.querySelector('[data-preview-action="external"]')?.addEventListener("click", openExternalPreview);
}

function renderMountedPanel() {
  if (!mountedPanel) return;

  const running = previewStatus === "running" && Boolean(previewUrl);
  const frameUrl = previewFrameUrl();
  const canRun = canRunWorkspacePreview();

  mountedPanel.innerHTML = `
    <div class="live-preview-header">
      <div class="tool-panel-heading">
        <div>
          <h2>Live Preview</h2>
          <p>Workspace-owned localhost preview for the active project folder.</p>
        </div>
      </div>
      <div class="live-preview-status ${canRun ? previewStatus : "failed"}">
        <span></span>${canRun ? previewStatus : "blocked"}
      </div>
    </div>

    <label class="live-preview-path-field">
      <span>Workspace folder</span>
      <input type="text" value="${escapeHtml(getPreviewProjectPath())}" spellcheck="false" data-preview-path-input />
    </label>

    <div class="live-preview-actions">
      <button type="button" data-preview-action="start" ${!canRun || previewStatus === "starting" ? "disabled" : ""}>
        ${running ? "Restart Preview" : previewStatus === "starting" ? "Starting..." : "Start Preview"}
      </button>
      <button type="button" data-preview-action="stop" ${running || previewStatus === "starting" ? "" : "disabled"}>
        Stop Preview
      </button>
      <button type="button" data-preview-action="refresh" ${running ? "" : "disabled"}>Refresh</button>
      <button type="button" data-preview-action="external" ${previewUrl ? "" : "disabled"}>Open External</button>
    </div>

    <div class="live-preview-meta">
      <span>${canRun ? previewUrl || "Preview not started" : escapeHtml(getWorkspacePreviewBlockedReason())}</span>
      ${previewPid !== null ? `<em>PID ${previewPid}</em>` : ""}
    </div>

    <div class="live-preview-frame-shell">
      ${running
        ? `<iframe title="Vivus embedded live preview" src="${frameUrl}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"></iframe>`
        : `<div class="live-preview-empty"><div class="preview-window"><div class="preview-window-top"></div><div class="preview-window-body">${escapeHtml(failureReason || (!canRun ? getWorkspacePreviewBlockedReason() : previewStatus === "starting" ? "Starting preview server..." : "Preview not started."))}</div></div></div>`}
    </div>
  `;

  bindPreviewControls();
}

function installLivePreviewPanel() {
  if (typeof document === "undefined") return;

  const placeholder = document.querySelector(".preview-panel-card .preview-placeholder");
  const card = document.querySelector(".preview-panel-card");

  if (!placeholder || !card || card.querySelector(".live-preview-frame-shell")) {
    return;
  }

  mountedPanel = card as HTMLElement;
  mountedPanel.classList.add("live-preview-panel");
  renderMountedPanel();
}

export function startLivePreviewInstaller() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  startStatusPolling();
  void syncPreviewStatus();

  const install = () => window.setTimeout(installLivePreviewPanel, 0);
  install();

  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList: true, subtree: true });
}
