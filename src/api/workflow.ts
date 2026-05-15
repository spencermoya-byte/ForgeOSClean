export interface Workflow {
  id: string;
  name: string;
  description: string;
  workspaceId: string | null;
  projectId: string | null;
  isActive: boolean;
  triggerType: string;
  triggerConfig: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  workflowId: string;
  name: string;
  description: string;
  stepType: string;
  config: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  result: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowData {
  name: string;
  description: string;
  workspaceId: string | null;
  projectId: string | null;
  triggerType: string;
  triggerConfig: string;
}

export interface UpdateWorkflowData {
  name?: string;
  description?: string;
  isActive?: boolean;
  triggerType?: string;
  triggerConfig?: string;
}

export interface CreateWorkflowStepData {
  workflowId: string;
  name: string;
  description: string;
  stepType: string;
  config: string;
  position: number;
}

export interface UpdateWorkflowStepData {
  name?: string;
  description?: string;
  stepType?: string;
  config?: string;
  position?: number;
  isActive?: boolean;
}

export const getWorkflows = async (workspaceId?: string, projectId?: string): Promise<Workflow[]> => {
  const params: any = {};
  if (workspaceId) params.workspaceId = workspaceId;
  if (projectId) params.projectId = projectId;
  
  const response = await window.__TAURI__.invoke('get_workflows', params);
  return response as Workflow[];
};

export const getWorkflow = async (id: string): Promise<Workflow> => {
  const response = await window.__TAURI__.invoke('get_workflow', { id });
  return response as Workflow;
};

export const createWorkflow = async (data: CreateWorkflowData): Promise<Workflow> => {
  const response = await window.__TAURI__.invoke('create_workflow', { request: data });
  return response as Workflow;
};

export const updateWorkflow = async (id: string, data: UpdateWorkflowData): Promise<Workflow> => {
  const response = await window.__TAURI__.invoke('update_workflow', { id, request: data });
  return response as Workflow;
};

export const deleteWorkflow = async (id: string): Promise<void> => {
  await window.__TAURI__.invoke('delete_workflow', { id });
};

export const getWorkflowSteps = async (workflowId: string): Promise<WorkflowStep[]> => {
  const response = await window.__TAURI__.invoke('get_workflow_steps', { workflowId });
  return response as WorkflowStep[];
};

export const createWorkflowStep = async (data: CreateWorkflowStepData): Promise<WorkflowStep> => {
  const response = await window.__TAURI__.invoke('create_workflow_step', { request: data });
  return response as WorkflowStep;
};

export const updateWorkflowStep = async (id: string, data: UpdateWorkflowStepData): Promise<WorkflowStep> => {
  const response = await window.__TAURI__.invoke('update_workflow_step', { id, request: data });
  return response as WorkflowStep;
};

export const createWorkflowExecution = async (workflowId: string): Promise<WorkflowExecution> => {
  const response = await window.__TAURI__.invoke('create_workflow_execution', { workflowId });
  return response as WorkflowExecution;
};

export const getWorkflowExecutions = async (workflowId: string): Promise<WorkflowExecution[]> => {
  const response = await window.__TAURI__.invoke('get_workflow_executions', { workflowId });
  return response as WorkflowExecution[];
};
