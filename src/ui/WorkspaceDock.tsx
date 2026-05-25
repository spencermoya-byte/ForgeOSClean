import React from "react";
import { Plus, X } from "lucide-react";

type OpenPlugin =
  | "preview"
  | "builder"
  | "files"
  | "commits"
  | "plugins"
  | "console"
  | "publish";

type Props = {
  workspaceTab: OpenPlugin;
  defaultPlugins: OpenPlugin[];
  openPlugins: OpenPlugin[];
  showPluginLauncher: boolean;
  switchWorkspaceTab: (
    tab: OpenPlugin
  ) => void;
  closePlugin: (
    plugin: OpenPlugin
  ) => void;
  setShowPluginLauncher:
    React.Dispatch<
      React.SetStateAction<boolean>
    >;
  pluginLabel: (
    plugin: OpenPlugin
  ) => string;
};

export function WorkspaceDock({
  workspaceTab,
  defaultPlugins,
  openPlugins,
  switchWorkspaceTab,
  closePlugin,
  setShowPluginLauncher,
  pluginLabel,
}: Props) {
  const defaultDockPlugins =
    defaultPlugins.filter(
      (pluginId) =>
        openPlugins.includes(
          pluginId
        )
    );

  const extensionDockPlugins =
    openPlugins.filter(
      (pluginId) =>
        !defaultPlugins.includes(
          pluginId
        )
    );

  function renderDockTab(
    pluginId: OpenPlugin,
    canClose: boolean
  ) {
    return (
      <button
        key={pluginId}
        type="button"
        className={`dock-tab ${
          workspaceTab ===
          pluginId
            ? "active"
            : ""
        }`}
        onClick={() =>
          switchWorkspaceTab(
            pluginId
          )
        }
      >
        {pluginLabel(pluginId)}

        {canClose && (
          <span
            role="button"
            tabIndex={0}
            className="dock-tab-close"
            onClick={(
              event
            ) => {
              event.stopPropagation();
              closePlugin(
                pluginId
              );
            }}
            aria-label={`Close ${pluginLabel(
              pluginId
            )}`}
          >
            <X size={12} />
          </span>
        )}
      </button>
    );
  }

  return (
    <nav
      className="workspace-dock"
      aria-label="Workspace plugins"
    >
      {defaultDockPlugins.map(
        (pluginId) =>
          renderDockTab(
            pluginId,
            false
          )
      )}

      <div
        className="dock-divider"
        aria-hidden="true"
      />

      {extensionDockPlugins.map(
        (pluginId) =>
          renderDockTab(
            pluginId,
            true
          )
      )}

      <button
        type="button"
        className="dock-plugin-launcher"
        onClick={() =>
          setShowPluginLauncher(
            (open) => !open
          )
        }
        aria-label="Open plugin launcher"
      >
        <Plus
          size={18}
          strokeWidth={2.5}
        />
      </button>
    </nav>
  );
}
