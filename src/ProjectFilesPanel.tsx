import React from "react";
import Editor from "@monaco-editor/react";

const DEFAULT_PROJECT_PATH = "C:/ForgeOSClean";
const PROJECT_PATH_KEY = "vivus.previewProjectPath.v1";
const MAX_TREE_DEPTH = 4;

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
  savedContent: string;
};

function readInitialProjectPath() {
  try {
    return window.localStorage.getItem(PROJECT_PATH_KEY)?.trim() || DEFAULT_PROJECT_PATH;
  } catch {
    return DEFAULT_PROJECT_PATH;
  }
}

function persistProjectPath(path: string) {
  try {
    window.localStorage.setItem(PROJECT_PATH_KEY, path.trim() || DEFAULT_PROJECT_PATH);
  } catch {}
}

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

function fileDepth(path: string) {
  return Math.max(0, path.split("/").length - 1);
}

export function initializeProjectFiles() {}

export function ProjectFilesPanel({ projectId }: { projectId: string }) {
  const [projectPath, setProjectPath] = React.useState(readInitialProjectPath);
  const [entries, setEntries] = React.useState<TreeEntry[]>([]);
  const [openTabs, setOpenTabs] = React.useState<OpenTab[]>([]);
  const [selectedPath, setSelectedPath] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [loadingTree, setLoadingTree] = React.useState(false);
  const [status, setStatus] = React.useState("Ready");

  const hasTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
  const selectedTab = openTabs.find((tab) => tab.path === selectedPath);
  const dirtyTabs = openTabs.filter((tab) => tab.content !== tab.savedContent);

  const listDirectory = React.useCallback(async (relativePath = "") => {
    const { invoke } = await import("@tauri-apps/api/core");

    return invoke<TreeResponse>("vivus_list_project_tree", {
      request: {
        projectPath,
        relativePath,
      },
    });
  }, [projectPath]);

  const loadProjectTree = React.useCallback(async () => {
    if (!hasTauri) {
      setStatus("Filesystem editing requires Tauri runtime.");
      return;
    }

    persistProjectPath(projectPath);
    setLoadingTree(true);

    try {
      const collected: TreeEntry[] = [];
      const queue: Array<{ path: string; depth: number }> = [{ path: "", depth: 0 }];

      while (queue.length > 0) {
        const current = queue.shift();
        if (!current) continue;

        const response = await listDirectory(current.path);

        if (!response.ok) {
          setStatus(response.blockedReason ?? "Unable to load project.");
          continue;
        }

        for (const entry of response.entries) {
          collected.push(entry);

          if (entry.entryType === "directory" && current.depth < MAX_TREE_DEPTH) {
            queue.push({ path: entry.relativePath, depth: current.depth + 1 });
          }
        }
      }

      collected.sort((a, b) => {
        if (a.entryType !== b.entryType) return a.entryType === "directory" ? -1 : 1;
        return a.relativePath.localeCompare(b.relativePath);
      });

      setEntries(collected);
      setStatus(`${collected.filter((entry) => entry.entryType === "file").length} files loaded`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingTree(false);
    }
  }, [projectPath, hasTauri, listDirectory]);

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
          savedContent: response.content,
        },
      ]);

      setSelectedPath(relativePath);
      setStatus(`Opened ${relativePath}`);
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

  const saveTab = React.useCallback(async (tab: OpenTab) => {
    if (!hasTauri) return false;

    const { invoke } = await import("@tauri-apps/api/core");

    const response = await invoke<{ ok: boolean; blockedReason?: string }>(
      "vivus_write_project_file",
      {
        request: {
          projectPath,
          relativePath: tab.path,
          content: tab.content,
        },
      }
    );

    if (!response.ok) {
      setStatus(response.blockedReason ?? `Save failed: ${tab.path}`);
      return false;
    }

    setOpenTabs((tabs) =>
      tabs.map((current) =>
        current.path === tab.path
          ? { ...current, savedContent: tab.content }
          : current
      )
    );

    return true;
  }, [projectPath, hasTauri]);

  const saveCurrentFile = React.useCallback(async () => {
    if (!selectedTab) return;

    setSaving(true);

    try {
      const ok = await saveTab(selectedTab);
      if (ok) {
        setStatus(`Saved ${selectedTab.path}`);
        window.dispatchEvent(new Event("vivus-preview-refresh"));
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }, [selectedTab, saveTab]);

  const saveAllFiles = React.useCallback(async () => {
    if (dirtyTabs.length === 0) return;

    setSaving(true);

    try {
      let saved = 0;
      for (const tab of dirtyTabs) {
        if (await saveTab(tab)) saved += 1;
      }
      setStatus(`Saved ${saved} file${saved === 1 ? "" : "s"}`);
      window.dispatchEvent(new Event("vivus-preview-refresh"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }, [dirtyTabs, saveTab]);

  const closeTab = React.useCallback((path: string) => {
    setOpenTabs((tabs) => {
      const nextTabs = tabs.filter((tab) => tab.path !== path);

      if (selectedPath === path) {
        setSelectedPath(nextTabs.at(-1)?.path ?? "");
      }

      return nextTabs;
    });
  }, [selectedPath]);

  React.useEffect(() => {
    void loadProjectTree();
  }, [loadProjectTree, projectId]);

  return (
    <section className="workspace-content files-workspace">
      <aside className="file-explorer-panel">
        <div className="file-explorer-header">
          <strong>Project Files</strong>
          <span>{entries.filter((entry) => entry.entryType === "file").length} files</span>
        </div>

        <div className="project-path-input-wrap">
          <input
            type="text"
            value={projectPath}
            onChange={(event) => setProjectPath(event.target.value)}
            spellCheck={false}
          />

          <button type="button" onClick={() => void loadProjectTree()} disabled={loadingTree}>
            {loadingTree ? "Loading" : "Load"}
          </button>
        </div>

        <div className="file-list nested-file-list">
          {entries.map((entry) => (
            <button
              key={entry.relativePath}
              type="button"
              className={`${entry.entryType === "directory" ? "file-row directory" : "file-row"} ${selectedPath === entry.relativePath ? "active" : ""}`.trim()}
              style={{ paddingLeft: `${12 + fileDepth(entry.relativePath) * 14}px` }}
              onClick={() => {
                if (entry.entryType === "file") void openFile(entry.relativePath);
              }}
            >
              <span>{entry.entryType === "directory" ? "▸" : ""} {entry.name}</span>
              {entry.entryType === "file" && dirtyTabs.some((tab) => tab.path === entry.relativePath) && <em>●</em>}
            </button>
          ))}
        </div>
      </aside>

      <section className="file-editor-panel">
        <div className="editor-tabs">
          {openTabs.map((tab) => {
            const dirty = tab.content !== tab.savedContent;

            return (
              <button
                key={tab.path}
                type="button"
                className={tab.path === selectedPath ? "editor-tab active" : "editor-tab"}
                onClick={() => setSelectedPath(tab.path)}
              >
                <span>{tab.path.split("/").pop()}{dirty ? " ●" : ""}</span>
                <em
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    closeTab(tab.path);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      closeTab(tab.path);
                    }
                  }}
                >
                  ×
                </em>
              </button>
            );
          })}
        </div>

        <div className="file-editor-header">
          <div>
            <strong>{selectedPath || "No file selected"}</strong>
            <span>{status}</span>
          </div>

          <div className="file-editor-actions">
            <button type="button" onClick={() => void saveAllFiles()} disabled={saving || dirtyTabs.length === 0}>
              Save All
            </button>
            <button type="button" onClick={() => void saveCurrentFile()} disabled={!selectedTab || saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="monaco-editor-shell">
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
