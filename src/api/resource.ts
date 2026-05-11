import axios from './axios';

export interface Resource {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  // Add other fields as needed
}

export interface CreateResourceData {
  name: string;
  description: string;
  // Add other fields as needed
}

export interface UpdateResourceData {
  name?: string;
  description?: string;
  // Add other fields as needed
}

export const getResource = async (id: string): Promise<Resource> => {
  const response = await axios.get(`/resources/${id}`);
  return response.data;
};

export const getResources = async (): Promise<Resource[]> => {
  const response = await axios.get('/resources');
  return response.data;
};

export const createResource = async (data: CreateResourceData): Promise<Resource> => {
  const response = await axios.post('/resources', data);
  return response.data;
};

export const updateResource = async (id: string, data: UpdateResourceData): Promise<Resource> => {
  const response = await axios.put(`/resources/${id}`, data);
  return response.data;
};

export const deleteResource = async (id: string): Promise<void> => {
  await axios.delete(`/resources/${id}`);
};
