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
  return [] as Workspace[];
};

export const getWorkspace = async (id: string): Promise<Workspace> => {
  return {} as Workspace;
};

export const createWorkspace = async (data: CreateWorkspaceData): Promise<Workspace> => {
  return {} as Workspace;
};

export const updateWorkspace = async (id: string, data: UpdateWorkspaceData): Promise<Workspace> => {
  return {} as Workspace;
};

export const deleteWorkspace = async (id: string): Promise<void> => {
  return;
};

export const setActiveWorkspace = async (id: string): Promise<void> => {
  return;
};

export const getActiveWorkspace = async (): Promise<Workspace | null> => {
  return null;
};

export const getWorkspaceByPath = async (path: string): Promise<Workspace | null> => {
  return null;
};

export const updateWorkspaceLastOpened = async (id: string): Promise<void> => {
  return;
};
