export type VivusProject = {
  id: string;
  name: string;
  rootPath: string;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number;
};

export type WorkspaceState = {
  activeProjectId: string | null;
  projects: VivusProject[];
};

const STORAGE_KEY = "vivus.workspace.projects.v1";
const LEGACY_PROJECT_PATH_KEY = "vivus.previewProjectPath.v1";

function now() {
  return Date.now();
}

function normalizePath(path: string) {
  return path.trim().replace(/\\+/g, "/").replace(/\/+$/, "");
}

function projectNameFromPath(path: string) {
  const normalized = normalizePath(path);
  const name = normalized.split("/").filter(Boolean).pop();
  return name || "Untitled Workspace";
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortProjects(projects: VivusProject[]) {
  return [...projects].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt || b.updatedAt - a.updatedAt);
}

function sanitizeProject(project: Partial<VivusProject>): VivusProject | null {
  const rootPath = normalizePath(String(project.rootPath ?? ""));
  if (!rootPath) return null;
  const createdAt = Number(project.createdAt || now());
  const updatedAt = Number(project.updatedAt || createdAt);
  const lastOpenedAt = Number(project.lastOpenedAt || updatedAt);
  return {
    id: String(project.id || createId()),
    name: String(project.name || projectNameFromPath(rootPath)).trim() || projectNameFromPath(rootPath),
    rootPath,
    createdAt,
    updatedAt,
    lastOpenedAt,
  };
}

function dedupeProjects(projects: VivusProject[]) {
  const byRoot = new Map<string, VivusProject>();
  for (const project of projects) {
    const key = normalizePath(project.rootPath).toLowerCase();
    const existing = byRoot.get(key);
    if (!existing || project.lastOpenedAt > existing.lastOpenedAt) byRoot.set(key, project);
  }
  return sortProjects([...byRoot.values()]);
}

function defaultState(): WorkspaceState {
  const legacyPath = typeof window !== "undefined" ? normalizePath(window.localStorage.getItem(LEGACY_PROJECT_PATH_KEY) ?? "") : "";
  if (!legacyPath) return { activeProjectId: null, projects: [] };
  const project = sanitizeProject({ rootPath: legacyPath, name: projectNameFromPath(legacyPath) });
  return project ? { activeProjectId: project.id, projects: [project] } : { activeProjectId: null, projects: [] };
}

export function readWorkspaceState(): WorkspaceState {
  if (typeof window === "undefined") return { activeProjectId: null, projects: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    const projects = dedupeProjects((Array.isArray(parsed.projects) ? parsed.projects : []).map(sanitizeProject).filter((project): project is VivusProject => Boolean(project)));
    const activeProjectId = projects.some((project) => project.id === parsed.activeProjectId) ? String(parsed.activeProjectId) : projects[0]?.id ?? null;
    return { activeProjectId, projects };
  } catch {
    return defaultState();
  }
}

export function writeWorkspaceState(state: WorkspaceState): WorkspaceState {
  const projects = dedupeProjects(state.projects.map(sanitizeProject).filter((project): project is VivusProject => Boolean(project)));
  const activeProjectId = projects.some((project) => project.id === state.activeProjectId) ? state.activeProjectId : projects[0]?.id ?? null;
  const next = { activeProjectId, projects };
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function listProjects() {
  return readWorkspaceState().projects;
}

export function getActiveProject() {
  const state = readWorkspaceState();
  return state.projects.find((project) => project.id === state.activeProjectId) ?? null;
}

export function getActiveProjectPath() {
  return getActiveProject()?.rootPath ?? "";
}

export function createProject(name: string, rootPath: string) {
  const normalizedRoot = normalizePath(rootPath);
  if (!normalizedRoot) throw new Error("Project root path is required.");
  const state = readWorkspaceState();
  const duplicate = state.projects.find((project) => normalizePath(project.rootPath).toLowerCase() === normalizedRoot.toLowerCase());
  const timestamp = now();
  if (duplicate) {
    const updated = { ...duplicate, name: name.trim() || duplicate.name, updatedAt: timestamp, lastOpenedAt: timestamp };
    return writeWorkspaceState({ activeProjectId: updated.id, projects: state.projects.map((project) => (project.id === duplicate.id ? updated : project)) });
  }
  const project: VivusProject = {
    id: createId(),
    name: name.trim() || projectNameFromPath(normalizedRoot),
    rootPath: normalizedRoot,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastOpenedAt: timestamp,
  };
  return writeWorkspaceState({ activeProjectId: project.id, projects: [project, ...state.projects] });
}

export function setActiveProject(projectId: string) {
  const state = readWorkspaceState();
  const timestamp = now();
  return writeWorkspaceState({ activeProjectId: projectId, projects: state.projects.map((project) => (project.id === projectId ? { ...project, lastOpenedAt: timestamp, updatedAt: timestamp } : project)) });
}

export function renameProject(projectId: string, name: string) {
  const state = readWorkspaceState();
  const trimmed = name.trim();
  if (!trimmed) return state;
  return writeWorkspaceState({ activeProjectId: state.activeProjectId, projects: state.projects.map((project) => (project.id === projectId ? { ...project, name: trimmed, updatedAt: now() } : project)) });
}

export function removeProject(projectId: string) {
  const state = readWorkspaceState();
  const projects = state.projects.filter((project) => project.id !== projectId);
  const activeProjectId = state.activeProjectId === projectId ? projects[0]?.id ?? null : state.activeProjectId;
  return writeWorkspaceState({ activeProjectId, projects });
}

export function updateProjectRoot(projectId: string, rootPath: string) {
  const normalizedRoot = normalizePath(rootPath);
  if (!normalizedRoot) throw new Error("Project root path is required.");
  const state = readWorkspaceState();
  return writeWorkspaceState({ activeProjectId: state.activeProjectId, projects: state.projects.map((project) => (project.id === projectId ? { ...project, rootPath: normalizedRoot, updatedAt: now() } : project)) });
}
