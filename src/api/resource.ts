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

// For Tauri integration, we'll use window.__TAURI__.invoke directly
export const getResource = async (id: string): Promise<Resource> => {
  // For Tauri, we'll use the Tauri invoke API
  const response = await window.__TAURI__.invoke('get_resource', { id });
  return response as Resource;
};

export const getResources = async (): Promise<Resource[]> => {
  // For Tauri, we'll use the Tauri invoke API
  const response = await window.__TAURI__.invoke('get_resources');
  return response as Resource[];
};

export const createResource = async (data: CreateResourceData): Promise<Resource> => {
  // For Tauri, we'll use the Tauri invoke API
  const response = await window.__TAURI__.invoke('create_resource', { request: data });
  return response as Resource;
};

export const updateResource = async (id: string, data: UpdateResourceData): Promise<Resource> => {
  // For Tauri, we'll use the Tauri invoke API
  const response = await window.__TAURI__.invoke('update_resource', { id, request: data });
  return response as Resource;
};

export const deleteResource = async (id: string): Promise<void> => {
  // For Tauri, we'll use the Tauri invoke API
  await window.__TAURI__.invoke('delete_resource', { id });
};
