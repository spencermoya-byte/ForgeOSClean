import axios from './axios';

export interface Resource {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceData {
  name: string;
  description: string;
}

export interface UpdateResourceData {
  name?: string;
  description?: string;
}

export interface ResourceFilter {
  filters?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  offset?: number;
}

export const getResource = async (id: string): Promise<Resource> => {
  const response = await window.__TAURI__.invoke('get_resource', { id });
  return response as Resource;
};

export const getResources = async (filter?: ResourceFilter): Promise<{ resources: Resource[], total: number }> => {
  const response = await window.__TAURI__.invoke('get_resources', filter || {});
  return response as { resources: Resource[], total: number };
};

export const createResource = async (data: CreateResourceData): Promise<Resource> => {
  const response = await window.__TAURI__.invoke('create_resource', { request: data });
  return response as Resource;
};

export const updateResource = async (id: string, data: UpdateResourceData): Promise<Resource> => {
  const response = await window.__TAURI__.invoke('update_resource', { id, request: data });
  return response as Resource;
};

export const deleteResource = async (id: string): Promise<void> => {
  await window.__TAURI__.invoke('delete_resource', { id });
};
