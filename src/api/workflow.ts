import { invoke } from "@tauri-apps/api/core";

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
  void workspaceId;
  void projectId;
  const result = await invoke('get_workflows');
  return result as Workflow[];
};

export const getWorkflow = async (id: string): Promise<Workflow> => {
  void id;
  const result = await invoke('get_workflow', { id });
  return result as Workflow;
};

export const createWorkflow = async (data: CreateWorkflowData): Promise<Workflow> => {
  void data;
  const result = await invoke('create_workflow', { data });
  return result as Workflow;
};

export const updateWorkflow = async (id: string, data: UpdateWorkflowData): Promise<Workflow> => {
  void id;
  void data;
  const result = await invoke('update_workflow', { id, data });
  return result as Workflow;
};

export const deleteWorkflow = async (id: string): Promise<void> => {
  void id;
  await invoke('delete_workflow', { id });
};

export const getWorkflowSteps = async (workflowId: string): Promise<WorkflowStep[]> => {
  void workflowId;
  const result = await invoke('get_workflow_steps', { workflowId });
  return result as WorkflowStep[];
};

export const createWorkflowStep = async (data: CreateWorkflowStepData): Promise<WorkflowStep> => {
  void data;
  const result = await invoke('create_workflow_step', { data });
  return result as WorkflowStep;
};

export const updateWorkflowStep = async (id: string, data: UpdateWorkflowStepData): Promise<WorkflowStep> => {
  void id;
  void data;
  const result = await invoke('update_workflow_step', { id, data });
  return result as WorkflowStep;
};

export const createWorkflowExecution = async (workflowId: string): Promise<WorkflowExecution> => {
  void workflowId;
  const result = await invoke('create_workflow_execution', { workflowId });
  return result as WorkflowExecution;
};

export const getWorkflowExecutions = async (workflowId: string): Promise<WorkflowExecution[]> => {
  void workflowId;
  const result = await invoke('get_workflow_executions', { workflowId });
  return result as WorkflowExecution[];
};
