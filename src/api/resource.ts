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
  return {} as Resource;
};

export const getResources = async (filter?: ResourceFilter): Promise<{ resources: Resource[], total: number }> => {
  return { resources: [], total: 0 };
};

export const createResource = async (data: CreateResourceData): Promise<Resource> => {
  return {} as Resource;
};

export const updateResource = async (id: string, data: UpdateResourceData): Promise<Resource> => {
  return {} as Resource;
};

export const deleteResource = async (id: string): Promise<void> => {
  return;
};
