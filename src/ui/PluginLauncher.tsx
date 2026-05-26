import { X } from "lucide-react";

type OpenPlugin =
  | "preview"
  | "builder"
  | "files"
  | "commits"
  | "plugins"
  | "console"
  | "publish";

type Props = {
  availablePlugins: Array<{
    id: OpenPlugin;
    label: string;
  }>;
  openPlugin: (
    pluginId: OpenPlugin
  ) => void;
  setShowPluginLauncher:
    React.Dispatch<
      React.SetStateAction<boolean>
    >;
};

export function PluginLauncher({
  availablePlugins,
  openPlugin,
  setShowPluginLauncher,
}: Props) {
  return (
    <div className="plugin-launcher">
      <div className="plugin-launcher-header">
        <h3>Open Tool</h3>

        <button
          type="button"
          className="plugin-launcher-close"
          onClick={() =>
            setShowPluginLauncher(
              false
            )
          }
          aria-label="Close plugin launcher"
        >
          <X size={16} />
        </button>
      </div>

      <div className="plugin-launcher-content">
        {availablePlugins.map(
          (plugin) => (
            <button
              key={plugin.id}
              type="button"
              className="plugin-launcher-item"
              onClick={() =>
                openPlugin(
                  plugin.id
                )
              }
            >
              {plugin.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}
