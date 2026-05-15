export interface Workspace {
  id: string;
  name: string;
  description: string;
  path: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceData {
  name: string;
  description: string;
  path: string;
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  path?: string;
  isActive?: boolean;
}

export const getWorkspaces = async (): Promise<Workspace[]> => {
  const response = await window.__TAURI__.invoke('get_workspaces');
  return response as Workspace[];
};

export const getWorkspace = async (id: string): Promise<Workspace> => {
  const response = await window.__TAURI__.invoke('get_workspace', { id });
  return response as Workspace;
};

export const createWorkspace = async (data: CreateWorkspaceData): Promise<Workspace> => {
  const response = await window.__TAURI__.invoke('create_workspace', { request: data });
  return response as Workspace;
};

export const updateWorkspace = async (id: string, data: UpdateWorkspaceData): Promise<Workspace> => {
  const response = await window.__TAURI__.invoke('update_workspace', { id, request: data });
  return response as Workspace;
};

export const deleteWorkspace = async (id: string): Promise<void> => {
  await window.__TAURI__.invoke('delete_workspace', { id });
};

export const setActiveWorkspace = async (id: string): Promise<void> => {
  await window.__TAURI__.invoke('set_active_workspace', { id });
};

export const getActiveWorkspace = async (): Promise<Workspace | null> => {
  const response = await window.__TAURI__.invoke('get_active_workspace');
  return response as Workspace | null;
};

export const getWorkspaceByPath = async (path: string): Promise<Workspace | null> => {
  const response = await window.__TAURI__.invoke('get_workspace_by_path', { path });
  return response as Workspace | null;
};

export const updateWorkspaceLastOpened = async (id: string): Promise<void> => {
  await window.__TAURI__.invoke('update_workspace_last_opened', { id });
};
