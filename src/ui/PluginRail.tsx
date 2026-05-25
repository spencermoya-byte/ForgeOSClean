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
};

export function PluginRail({
  openPlugins,
  workspaceTab,
  pluginLabel,
  switchWorkspaceTab,
}: Props) {
  return (
    <aside className="workspace-plugin-rail">
      {openPlugins.map((plugin) => (
        <button
          key={plugin}
          type="button"
          className={`plugin-rail-button ${
            workspaceTab ===
            plugin
              ? "active"
              : ""
          }`}
          onClick={() =>
            switchWorkspaceTab(
              plugin
            )
          }
        >
          {pluginLabel(plugin)}
        </button>
      ))}
    </aside>
  );
}