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
  void id;
  return {} as Resource;
};

export const getResources = async (filter?: ResourceFilter): Promise<{ resources: Resource[], total: number }> => {
  void filter;
  return { resources: [], total: 0 };
};

export const createResource = async (data: CreateResourceData): Promise<Resource> => {
  void data;
  return {} as Resource;
};

export const updateResource = async (id: string, data: UpdateResourceData): Promise<Resource> => {
  void id;
  void data;
  return {} as Resource;
};

export const deleteResource = async (id: string): Promise<void> => {
  void id;
  return;
};
