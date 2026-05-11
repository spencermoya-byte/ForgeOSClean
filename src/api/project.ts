import axios from './axios';

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
  const response = await window.__TAURI__.invoke('get_projects', { workspaceId });
  return response as Project[];
};

export const getProject = async (id: string): Promise<Project> => {
  const response = await window.__TAURI__.invoke('get_project', { id });
  return response as Project;
};

export const createProject = async (data: CreateProjectData): Promise<Project> => {
  const response = await window.__TAURI__.invoke('create_project', { request: data });
  return response as Project;
};

export const updateProject = async (id: string, data: UpdateProjectData): Promise<Project> => {
  const response = await window.__TAURI__.invoke('update_project', { id, request: data });
  return response as Project;
};

export const deleteProject = async (id: string): Promise<void> => {
  await window.__TAURI__.invoke('delete_project', { id });
};

export const setActiveProject = async (id: string): Promise<void> => {
  await window.__TAURI__.invoke('set_active_project', { id });
};

export const getActiveProject = async (): Promise<Project | null> => {
  const response = await window.__TAURI__.invoke('get_active_project');
  return response as Project | null;
};
