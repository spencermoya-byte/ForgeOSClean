import "./LivePreviewPanel.css";

type PreviewStatus = "stopped" | "starting" | "running" | "failed";

type LivePreviewStartResponse = {
  url?: string;
  pid?: number;
  failure_reason?: string;
  failureReason?: string;
};

const DEFAULT_PREVIEW_URL = "http://127.0.0.1:1420";
const DEFAULT_PROJECT_PATH = "C:/ForgeOSClean";

let previewUrl = "";
let previewPid: number | null = null;
let previewStatus: PreviewStatus = "stopped";
let failureReason = "";
let refreshKey = 0;
let mountedPanel: HTMLElement | null = null;

function hasTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function normalizePreviewResponse(response: LivePreviewStartResponse | null | undefined) {
  const failure = response?.failure_reason ?? response?.failureReason ?? "";
  const url = typeof response?.url === "string" && response.url.trim()
    ? response.url.trim()
    : DEFAULT_PREVIEW_URL;

  const pid = typeof response?.pid === "number"
    ? response.pid
    : null;

  return {
    ok: !failure,
    url,
    pid,
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

async function startLivePreview() {
  if (previewStatus === "starting") return;

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

    const response = await invoke<LivePreviewStartResponse>(
      "vivus_start_dev_server",
      {
        request: {
          projectPath: DEFAULT_PROJECT_PATH,
        },
      }
    );

    const normalized = normalizePreviewResponse(response);

    if (!normalized.ok) {
      setStatus(
        "failed",
        normalized.failureReason || "Preview server failed to start."
      );
      return;
    }

    previewUrl = normalized.url;
    previewPid = normalized.pid;
    refreshKey += 1;
    setStatus("running");
  } catch (error) {
    setStatus(
      "failed",
      error instanceof Error ? error.message : String(error)
    );
  }
}

function openExternalPreview() {
  if (!previewUrl) return;
  window.open(previewUrl, "_blank", "noopener,noreferrer");
}

function previewFrameUrl() {
  if (!previewUrl || previewStatus !== "running") return "";

  return `${previewUrl}${
    previewUrl.includes("?") ? "&" : "?"
  }vivus_refresh=${refreshKey}`;
}

function renderMountedPanel() {
  if (!mountedPanel) return;

  const running =
    previewStatus === "running" && Boolean(previewUrl);

  const frameUrl = previewFrameUrl();

  const escapedReason = failureReason.replace(
    /[&<>\"]/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
      }[char] ?? char)
  );

  mountedPanel.innerHTML = `
    <div class="live-preview-header">
      <div class="tool-panel-heading">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        <div>
          <h2>Live Preview</h2>
          <p>Embedded localhost preview for the current Vivus project.</p>
        </div>
      </div>
      <div class="live-preview-status ${previewStatus}">
        <span></span>${previewStatus}
      </div>
    </div>

    <div class="live-preview-actions">
      <button type="button" data-preview-action="start" ${previewStatus === "starting" ? "disabled" : ""}>
        ${previewStatus === "starting" ? "Starting..." : running ? "Restart Preview" : "Start Preview"}
      </button>
      <button type="button" data-preview-action="refresh" ${running ? "" : "disabled"}>
        Refresh
      </button>
      <button type="button" data-preview-action="external" ${previewUrl ? "" : "disabled"}>
        Open External
      </button>
    </div>

    <div class="live-preview-meta">
      <span>${previewUrl || "Preview not started"}</span>
      ${previewPid !== null ? `<em>PID ${previewPid}</em>` : ""}
    </div>

    <div class="live-preview-frame-shell">
      ${running
        ? `<iframe title="Vivus embedded live preview" src="${frameUrl}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"></iframe>`
        : `<div class="live-preview-empty"><div class="preview-window"><div class="preview-window-top"></div><div class="preview-window-body">${previewStatus === "failed" ? escapedReason || "Preview failed to start." : "Preview not started."}</div></div><p>${previewStatus === "failed" ? "Fix the dev server issue, then start preview again." : "Start the local dev server to load http://127.0.0.1:1420 here."}</p></div>`}
    </div>
  `;

  mountedPanel
    .querySelector('[data-preview-action="start"]')
    ?.addEventListener("click", startLivePreview);

  mountedPanel
    .querySelector('[data-preview-action="refresh"]')
    ?.addEventListener("click", refreshPreview);

  mountedPanel
    .querySelector('[data-preview-action="external"]')
    ?.addEventListener("click", openExternalPreview);
}

function installLivePreviewPanel() {
  if (typeof document === "undefined") return;

  const placeholder = document.querySelector(
    ".preview-panel-card .preview-placeholder"
  );

  const card = document.querySelector(
    ".preview-panel-card"
  );

  if (!placeholder || !card || card.querySelector(".live-preview-frame-shell")) {
    return;
  }

  mountedPanel = card as HTMLElement;
  mountedPanel.classList.add("live-preview-panel");
  renderMountedPanel();
}

export function startLivePreviewInstaller() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  window.addEventListener(
    "vivus-preview-refresh",
    refreshPreview
  );

  const install = () => window.setTimeout(installLivePreviewPanel, 0);

  install();

  const observer = new MutationObserver(install);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
