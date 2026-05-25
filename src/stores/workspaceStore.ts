import { useSyncExternalStore } from "react";

import {
  createProject as createRegistryProject,
  getActiveProject,
  listProjects,
  removeProject as removeRegistryProject,
  renameProject as renameRegistryProject,
  setActiveProject as setRegistryActiveProject,
  type VivusProject,
} from "../lib/projects/projectRegistry";
import { emitWorkspaceChanged, emitWorkspaceRefresh } from "../workspaceEvents";

export type WorkspaceStoreSnapshot = {
  activeProject: VivusProject | null;
  projects: VivusProject[];
};

export type WorkspaceStoreApi = WorkspaceStoreSnapshot & {
  refreshProjects: () => void;
  setActiveProject: (id: string) => void;
  createProject: (name: string, rootPath: string) => Promise<VivusProject | null>;
  removeProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
};

type Listener = () => void;

let listeners = new Set<Listener>();
let snapshot: WorkspaceStoreSnapshot = readSnapshot();

function readSnapshot(): WorkspaceStoreSnapshot {
  return {
    activeProject: getActiveProject(),
    projects: listProjects(),
  };
}

function emitWorkspaceStoreChanged() {
  emitWorkspaceChanged(snapshot);
  emitWorkspaceRefresh();
}

function refreshSnapshot() {
  snapshot = readSnapshot();
  listeners.forEach((listener) => listener());
  emitWorkspaceStoreChanged();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

const workspaceActions = {
  refreshProjects() {
    refreshSnapshot();
  },

  setActiveProject(id: string) {
    if (!id.trim()) return;
    setRegistryActiveProject(id);
    refreshSnapshot();
  },

  async createProject(name: string, rootPath: string) {
    const state = createRegistryProject(name, rootPath);
    refreshSnapshot();
    return state.projects.find((project) => project.id === state.activeProjectId) ?? null;
  },

  removeProject(id: string) {
    if (!id.trim()) return;
    removeRegistryProject(id);
    refreshSnapshot();
  },

  renameProject(id: string, name: string) {
    if (!id.trim() || !name.trim()) return;
    renameRegistryProject(id, name);
    refreshSnapshot();
  },
};

export function getWorkspaceSnapshot(): WorkspaceStoreSnapshot {
  snapshot = readSnapshot();
  return snapshot;
}

export function getActiveWorkspaceProject(): VivusProject | null {
  return getWorkspaceSnapshot().activeProject;
}

export function getActiveWorkspaceRootPath(): string {
  return getActiveWorkspaceProject()?.rootPath ?? "";
}

export function useWorkspaceStore(): WorkspaceStoreApi {
  const currentSnapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...currentSnapshot,
    ...workspaceActions,
  };
}
