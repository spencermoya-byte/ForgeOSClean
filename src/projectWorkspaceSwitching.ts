export type ProjectWorkspaceRecord = {
  id: string;
  name: string;
  path: string;
  isActive: boolean;
  lastOpenedAt: string;
  createdAt: string;
};

const STORAGE_KEY = 'vivus.projectWorkspaces.v1';

function readProjects(): ProjectWorkspaceRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeProjects(projects: ProjectWorkspaceRecord[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, 100)));
  } catch {}
}

function inferProjectName(path: string) {
  const normalized = path.replace(/\\/g, '/').replace(/\/$/, '');
  return normalized.split('/').pop() || 'Untitled Project';
}

export function registerProjectWorkspace(path: string, name = inferProjectName(path)) {
  const existing = readProjects();
  const current = existing.find((project) => project.path === path);
  const now = new Date().toISOString();

  if (current) {
    const next = { ...current, name, lastOpenedAt: now };
    writeProjects([next, ...existing.filter((project) => project.id !== current.id)]);
    return next;
  }

  const project: ProjectWorkspaceRecord = {
    id: `project-${Date.now()}`,
    name,
    path,
    isActive: false,
    lastOpenedAt: now,
    createdAt: now,
  };

  writeProjects([project, ...existing]);
  return project;
}

export function switchProjectWorkspace(projectId: string) {
  const now = new Date().toISOString();
  let active: ProjectWorkspaceRecord | undefined;

  const projects = readProjects().map((project) => {
    const isActive = project.id === projectId;
    const next = {
      ...project,
      isActive,
      lastOpenedAt: isActive ? now : project.lastOpenedAt,
    };
    if (isActive) active = next;
    return next;
  });

  writeProjects(projects.sort((a, b) => Number(b.isActive) - Number(a.isActive)));
  return active;
}

export function getActiveProjectWorkspace() {
  return readProjects().find((project) => project.isActive) ?? readProjects()[0];
}

export function listProjectWorkspaces() {
  return readProjects().sort((a, b) => b.lastOpenedAt.localeCompare(a.lastOpenedAt));
}

export function removeProjectWorkspace(projectId: string) {
  const remaining = readProjects().filter((project) => project.id !== projectId);

  if (remaining.length && !remaining.some((project) => project.isActive)) {
    remaining[0] = {
      ...remaining[0],
      isActive: true,
      lastOpenedAt: new Date().toISOString(),
    };
  }

  writeProjects(remaining);
  return remaining;
}
