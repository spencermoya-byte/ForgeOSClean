import React from "react";

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

export function initializeProjectFiles() {}

export function ProjectFilesPanel({ projectId }: { projectId: string }) {
  const [projectPath, setProjectPath] = React.useState(DEFAULT_PROJECT_PATH);
  const [files, setFiles] = React.useState<TreeEntry[]>([]);
  const [selectedPath, setSelectedPath] = React.useState("");
  const [fileContent, setFileContent] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState("Ready");

  const hasTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

  const loadProjectTree = React.useCallback(async () => {
    if (!hasTauri) {
      setStatus("Filesystem editing requires Tauri runtime.");
      return;
    }

    setLoading(true);

    try {
      const { invoke } = await import("@tauri-apps/api/core");

      const response = await invoke<TreeResponse>(
        "vivus_list_project_tree",
        {
          request: {
            projectPath,
          },
        }
      );

      if (!response.ok) {
        setStatus(response.blockedReason ?? "Unable to load project.");
        return;
      }

      const filteredFiles = response.entries.filter(
        (entry) => entry.entryType === "file"
      );

      setFiles(filteredFiles);

      if (!selectedPath && filteredFiles.length > 0) {
        setSelectedPath(filteredFiles[0].relativePath);
      }

      setStatus(`${filteredFiles.length} files loaded`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [projectPath, selectedPath, hasTauri]);

  const loadFile = React.useCallback(async () => {
    if (!selectedPath || !hasTauri) return;

    try {
      const { invoke } = await import("@tauri-apps/api/core");

      const response = await invoke<FileResponse>(
        "vivus_read_project_file",
        {
          request: {
            projectPath,
            relativePath: selectedPath,
          },
        }
      );

      if (!response.ok) {
        setStatus(response.blockedReason ?? "Unable to open file.");
        return;
      }

      setFileContent(response.content);
      setStatus(`Opened ${response.relativePath}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }, [projectPath, selectedPath, hasTauri]);

  const saveFile = React.useCallback(async () => {
    if (!selectedPath || !hasTauri) return;

    setSaving(true);

    try {
      const { invoke } = await import("@tauri-apps/api/core");

      const response = await invoke<{ ok: boolean; blockedReason?: string }>(
        "vivus_write_project_file",
        {
          request: {
            projectPath,
            relativePath: selectedPath,
            content: fileContent,
          },
        }
      );

      if (!response.ok) {
        setStatus(response.blockedReason ?? "Save failed.");
        return;
      }

      setStatus(`Saved ${selectedPath}`);
      window.dispatchEvent(new Event("vivus-preview-refresh"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }, [projectPath, selectedPath, fileContent, hasTauri]);

  React.useEffect(() => {
    void loadProjectTree();
  }, [loadProjectTree, projectId]);

  React.useEffect(() => {
    void loadFile();
  }, [loadFile]);

  return (
    <section className="workspace-content files-workspace">
      <aside className="file-explorer-panel">
        <div className="file-explorer-header">
          <div>
            <strong>Project Files</strong>
            <span>{files.length} files</span>
          </div>
        </div>

        <div className="project-path-input-wrap">
          <input
            type="text"
            value={projectPath}
            onChange={(event) => setProjectPath(event.target.value)}
            spellCheck={false}
            placeholder="Project folder path"
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
              className={file.relativePath === selectedPath ? "file-row active" : "file-row"}
              onClick={() => setSelectedPath(file.relativePath)}
            >
              {file.relativePath}
            </button>
          ))}
        </div>
      </aside>

      <section className="file-editor-panel">
        <div className="file-editor-header">
          <div>
            <strong>{selectedPath || "No file selected"}</strong>
            <span>{status}</span>
          </div>

          <button type="button" onClick={() => void saveFile()} disabled={saving || !selectedPath}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <textarea
          className="file-editor-textarea"
          value={fileContent}
          onChange={(event) => setFileContent(event.target.value)}
          spellCheck={false}
          placeholder={loading ? "Loading files..." : "Select a file to edit"}
        />
      </section>
    </section>
  );
}
