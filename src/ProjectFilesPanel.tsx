import React from "react";

type ProjectFile = {
  path: string;
  language: string;
  content: string;
};

const fileKey = (projectId: string) => `vivus.projectFiles.v1.${projectId}`;

const starterFiles: ProjectFile[] = [
  {
    path: "package.json",
    language: "json",
    content: `{
  "name": "vivus-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  }
}`,
  },
  {
    path: "index.html",
    language: "html",
    content: `<div id="root"></div>
<script type="module" src="/src/App.tsx"></script>`,
  },
  {
    path: "src/App.tsx",
    language: "tsx",
    content: `export default function App() {
  return (
    <main className="app-shell">
      <h1>New Vivus Project</h1>
      <p>Start building locally.</p>
    </main>
  );
}`,
  },
  {
    path: "src/App.css",
    language: "css",
    content: `.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #080a12;
  color: white;
}`,
  },
];

function loadFiles(projectId: string): ProjectFile[] {
  if (!projectId) return starterFiles;

  try {
    const raw = localStorage.getItem(fileKey(projectId));
    if (!raw) return starterFiles;
    const parsed = JSON.parse(raw) as ProjectFile[];
    return Array.isArray(parsed) && parsed.length ? parsed : starterFiles;
  } catch {
    return starterFiles;
  }
}

function saveFiles(projectId: string, files: ProjectFile[]) {
  if (!projectId) return;
  localStorage.setItem(fileKey(projectId), JSON.stringify(files));
}

export function initializeProjectFiles(projectId: string) {
  if (!projectId) return;
  const key = fileKey(projectId);
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(starterFiles));
  }
}

export function ProjectFilesPanel({ projectId }: { projectId: string }) {
  const [files, setFiles] = React.useState<ProjectFile[]>(() => loadFiles(projectId));
  const [selectedPath, setSelectedPath] = React.useState(() => files[0]?.path ?? "src/App.tsx");
  const selectedFile = files.find((file) => file.path === selectedPath) ?? files[0];

  React.useEffect(() => {
    const nextFiles = loadFiles(projectId);
    setFiles(nextFiles);
    setSelectedPath(nextFiles[0]?.path ?? "src/App.tsx");
  }, [projectId]);

  function updateSelectedFile(content: string) {
    const nextFiles = files.map((file) => (file.path === selectedFile.path ? { ...file, content } : file));
    setFiles(nextFiles);
    saveFiles(projectId, nextFiles);
  }

  if (!projectId) {
    return (
      <section className="workspace-content tool-panel-screen">
        <div className="tool-panel-card">
          <h2>Files</h2>
          <p className="placeholder-copy">Create or open a project before editing files.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-content files-workspace">
      <aside className="file-explorer-panel">
        <div className="file-explorer-header">
          <strong>Project Files</strong>
          <span>{files.length} files</span>
        </div>
        <div className="file-list">
          {files.map((file) => (
            <button
              key={file.path}
              type="button"
              className={file.path === selectedFile.path ? "file-row active" : "file-row"}
              onClick={() => setSelectedPath(file.path)}
            >
              {file.path}
            </button>
          ))}
        </div>
      </aside>

      <section className="file-editor-panel">
        <div className="file-editor-header">
          <strong>{selectedFile.path}</strong>
          <span>{selectedFile.language}</span>
        </div>
        <textarea
          className="file-editor-textarea"
          value={selectedFile.content}
          onChange={(event) => updateSelectedFile(event.target.value)}
          spellCheck={false}
        />
      </section>
    </section>
  );
}
