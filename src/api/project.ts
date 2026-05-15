export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  workspaceId: string;
  name: string;
  description: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const getProjects = async (workspaceId: string): Promise<Project[]> => {
  return [] as Project[];
};

export const getProject = async (id: string): Promise<Project> => {
  return {} as Project;
};

export const createProject = async (data: CreateProjectData): Promise<Project> => {
  return {} as Project;
};

export const updateProject = async (id: string, data: UpdateProjectData): Promise<Project> => {
  return {} as Project;
};

export const deleteProject = async (id: string): Promise<void> => {
  return;
};

export const setActiveProject = async (id: string): Promise<void> => {
  return;
};

export const getActiveProject = async (): Promise<Project | null> => {
  return null;
};
