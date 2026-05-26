type OpenPlugin =
  | "preview"
  | "builder"
  | "files"
  | "commits"
  | "plugins"
  | "console"
  | "publish";

type Props = {
  openPlugins: OpenPlugin[];
  workspaceTab: OpenPlugin;
  pluginLabel: (
    plugin: OpenPlugin
  ) => string;
  switchWorkspaceTab: (
    plugin: OpenPlugin
  ) => void;
  className?: string;
};

export function PluginRail({
  openPlugins,
  workspaceTab,
  pluginLabel,
  switchWorkspaceTab,
  className,
}: Props) {
  return (
    <aside
      className={
        className ??
        "workspace-plugin-rail"
      }
      aria-label="Workspace plugins"
    >
      {openPlugins.map((plugin) => (
        <button
          key={plugin}
          type="button"
          className={`plugin-rail-button ${
            workspaceTab === plugin
              ? "active"
              : ""
          }`}
          onClick={() =>
            switchWorkspaceTab(
              plugin
            )
          }
          aria-pressed={
            workspaceTab === plugin
          }
        >
          {pluginLabel(plugin)}
        </button>
      ))}
    </aside>
  );
}
