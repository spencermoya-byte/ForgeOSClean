import React from "react";
import { Monitor, RefreshCw, TerminalSquare } from "lucide-react";
import { getPreviewWorkspaceScope, type PreviewWorkspaceScope } from "./workspacePreviewScope";
import { subscribeWorkspaceChanged } from "./workspaceEvents";

type PreviewStatus = "idle" | "ready" | "blocked" | "refreshing";

function readPreviewScope() {
  return getPreviewWorkspaceScope();
}

function statusFromScope(scope: PreviewWorkspaceScope): PreviewStatus {
  if (!scope.enabled) return "blocked";
  return "ready";
}

export function WorkspacePreviewPanel() {
  const [scope, setScope] = React.useState(readPreviewScope);
  const [status, setStatus] = React.useState<PreviewStatus>(() => statusFromScope(readPreviewScope()));
  const [lastRefresh, setLastRefresh] = React.useState("");

  React.useEffect(() => {
    return subscribeWorkspaceChanged(() => {
      const nextScope = readPreviewScope();
      setScope(nextScope);
      setStatus(statusFromScope(nextScope));
    });
  }, []);

  React.useEffect(() => {
    const refresh = () => {
      const nextScope = readPreviewScope();
      setScope(nextScope);

      if (!nextScope.enabled || !nextScope.refreshAllowed) {
        setStatus("blocked");
        return;
      }

      setStatus("refreshing");
      window.setTimeout(() => {
        setStatus("ready");
        setLastRefresh(new Date().toLocaleTimeString());
      }, 250);
    };

    window.addEventListener("vivus-preview-refresh", refresh);
    return () => window.removeEventListener("vivus-preview-refresh", refresh);
  }, []);

  const blocked = status === "blocked";

  return (
    <section className="workspace-content tool-panel-screen">
      <div className="tool-panel-card preview-panel-card">
        <div className="tool-panel-heading">
          <Monitor size={18} />
          <h2>Live Preview</h2>
        </div>

        <div className="preview-placeholder">
          <div className="preview-window">
            <div className="preview-window-top" />
            <div className="preview-window-body">
              {blocked ? "No valid workspace selected." : "Workspace preview is ready."}
            </div>
          </div>

          <div className="preview-runtime-status">
            <span className={`preview-status-dot ${status}`} />
            <strong>{blocked ? "Preview blocked" : status === "refreshing" ? "Refreshing preview" : "Workspace preview ready"}</strong>
            <p>{blocked ? scope.blockedReason ?? "Select a valid workspace to enable preview." : scope.projectPath}</p>
            {lastRefresh && <em>Last refresh: {lastRefresh}</em>}
          </div>

          <div className="preview-actions">
            <button
              type="button"
              disabled={blocked}
              onClick={() => window.dispatchEvent(new Event("vivus-preview-refresh"))}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
            <button type="button" disabled={blocked}>
              <TerminalSquare size={15} />
              Run workspace
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
