import React from "react";
import Editor from "@monaco-editor/react";

const DEFAULT_PROJECT_PATH = "C:/ForgeOSClean";

type TreeEntry = {
  name: string;
  relativePath: string;
  entryType: "file" | "directory";
  sizeBytes?: number;
};

type TreeResponse = {
  ok: boolean;
  entries: TreeEntry[];
  blockedReason?: string;
};

type FileResponse = {
  ok: boolean;
  content: string;
  relativePath: string;
  blockedReason?: string;
};

type OpenTab = {
  path: string;
  content: string;
};

function languageFromPath(path: string) {
  const ext = path.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "rs":
      return "rust";
    case "css":
      return "css";
    case "html":
      return "html";
    case "json":
      return "json";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
}

export function initializeProjectFiles() {}

export function ProjectFilesPanel({ projectId }: { projectId: string }) {
  const [projectPath, setProjectPath] = React.useState(DEFAULT_PROJECT_PATH);
  const [files, setFiles] = React.useState<TreeEntry[]>([]);
  const [openTabs, setOpenTabs] = React.useState<OpenTab[]>([]);
  const [selectedPath, setSelectedPath] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState("Ready");

  const hasTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
  const selectedTab = openTabs.find((tab) => tab.path === selectedPath);

  const loadProjectTree = React.useCallback(async () => {
    if (!hasTauri) return;

    try {
      const { invoke } = await import("@tauri-apps/api/core");

      const response = await invoke<TreeResponse>("vivus_list_project_tree", {
        request: { projectPath },
      });

      if (!response.ok) {
        setStatus(response.blockedReason ?? "Unable to load project.");
        return;
      }

      setFiles(response.entries.filter((entry) => entry.entryType === "file"));
      setStatus(`${response.entries.length} entries loaded`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }, [projectPath, hasTauri]);

  const openFile = React.useCallback(async (relativePath: string) => {
    if (!hasTauri) return;

    const existing = openTabs.find((tab) => tab.path === relativePath);
    if (existing) {
      setSelectedPath(relativePath);
      return;
    }

    try {
      const { invoke } = await import("@tauri-apps/api/core");

      const response = await invoke<FileResponse>("vivus_read_project_file", {
        request: {
          projectPath,
          relativePath,
        },
      });

      if (!response.ok) {
        setStatus(response.blockedReason ?? "Unable to open file.");
        return;
      }

      setOpenTabs((tabs) => [
        ...tabs,
        {
          path: relativePath,
          content: response.content,
        },
      ]);

      setSelectedPath(relativePath);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }, [projectPath, openTabs, hasTauri]);

  const updateEditorContent = React.useCallback((content?: string) => {
    if (!selectedPath || typeof content !== "string") return;

    setOpenTabs((tabs) =>
      tabs.map((tab) =>
        tab.path === selectedPath
          ? { ...tab, content }
          : tab
      )
    );
  }, [selectedPath]);

  const saveFile = React.useCallback(async () => {
    if (!selectedTab || !hasTauri) return;

    setSaving(true);

    try {
      const { invoke } = await import("@tauri-apps/api/core");

      const response = await invoke<{ ok: boolean; blockedReason?: string }>(
        "vivus_write_project_file",
        {
          request: {
            projectPath,
            relativePath: selectedTab.path,
            content: selectedTab.content,
          },
        }
      );

      if (!response.ok) {
        setStatus(response.blockedReason ?? "Save failed.");
        return;
      }

      setStatus(`Saved ${selectedTab.path}`);
      window.dispatchEvent(new Event("vivus-preview-refresh"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }, [selectedTab, projectPath, hasTauri]);

  React.useEffect(() => {
    void loadProjectTree();
  }, [loadProjectTree, projectId]);

  return (
    <section className="workspace-content files-workspace">
      <aside className="file-explorer-panel">
        <div className="file-explorer-header">
          <strong>Project Files</strong>
          <span>{files.length} files</span>
        </div>

        <div className="project-path-input-wrap">
          <input
            type="text"
            value={projectPath}
            onChange={(event) => setProjectPath(event.target.value)}
            spellCheck={false}
          />

          <button type="button" onClick={() => void loadProjectTree()}>
            Load
          </button>
        </div>

        <div className="file-list">
          {files.map((file) => (
            <button
              key={file.relativePath}
              type="button"
              className={selectedPath === file.relativePath ? "file-row active" : "file-row"}
              onClick={() => void openFile(file.relativePath)}
            >
              {file.relativePath}
            </button>
          ))}
        </div>
      </aside>

      <section className="file-editor-panel">
        <div className="editor-tabs">
          {openTabs.map((tab) => (
            <button
              key={tab.path}
              type="button"
              className={tab.path === selectedPath ? "editor-tab active" : "editor-tab"}
              onClick={() => setSelectedPath(tab.path)}
            >
              {tab.path.split("/").pop()}
            </button>
          ))}
        </div>

        <div className="file-editor-header">
          <div>
            <strong>{selectedPath || "No file selected"}</strong>
            <span>{status}</span>
          </div>

          <button type="button" onClick={() => void saveFile()} disabled={!selectedTab || saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <Editor
            height="100%"
            theme="vs-dark"
            language={languageFromPath(selectedPath)}
            value={selectedTab?.content ?? ""}
            onChange={updateEditorContent}
            options={{
              minimap: { enabled: true },
              automaticLayout: true,
              smoothScrolling: true,
              fontSize: 14,
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </section>
    </section>
  );
}
