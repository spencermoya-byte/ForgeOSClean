import axios from './axios';

export interface AiModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiProvider {
  id: string;
  name: string;
  type: string;
  baseUrl: string;
  apiKey: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiContext {
  workspaceId?: string;
  projectId?: string;
  resourceId?: string;
  filePath?: string;
  tags?: string[];
}

export interface AiRequest {
  prompt: string;
  modelId?: string;
  providerId?: string;
  context?: AiContext;
  stream?: boolean;
}

export interface AiResponse {
  content: string;
  modelId: string;
  providerId: string;
  tokensUsed?: number;
  createdAt: string;
}

export interface AiChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  modelId?: string;
  providerId?: string;
}

export interface AiChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AiChatMessage[];
}

export interface WorkflowSuggestion {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  confidence: number;
  createdAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  stepType: string;
  config: any;
  position: number;
}

export interface WorkflowContext {
  workspaceId?: string;
  projectId?: string;
  resourceId?: string;
  tags?: string[];
  content?: string;
}

export interface WorkflowGenerationRequest {
  prompt: string;
  context: WorkflowContext;
  maxSteps?: number;
}

export interface WorkflowGenerationResponse {
  workflow: WorkflowSuggestion;
  generatedAt: string;
}

export interface PluginCapability {
  id: string;
  pluginId: string;
  capability: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PluginContext {
  pluginId: string;
  capabilities: PluginCapability[];
  settings: any[];
}

// Agent-related interfaces
export interface Agent {
  id: string;
  name: string;
  description: string;
  type: string;
  capabilities: string[];
  isActive: boolean;
  config: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCapability {
  id: string;
  agentId: string;
  capability: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  taskId: string;
  status: string;
  result?: string;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTask {
  id: string;
  agentId: string;
  name: string;
  description: string;
  context: string;
  priority: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentExecutionRequest {
  agentId: string;
  task: AgentTask;
  context?: string;
}

export interface AgentExecutionResponse {
  execution: AgentExecution;
}

// Knowledge Graph interfaces
export interface GraphNode {
  id: string;
  nodeType: string;
  name: string;
  description: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: string;
  weight: number;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface GraphContext {
  entities: GraphNode[];
  relationships: GraphEdge[];
  contextualMetadata: any[];
  relevanceScore: number;
  createdAt: string;
}

export interface GraphQuery {
  entityTypes: string[];
  relationshipTypes: string[];
  contextFilters: any;
  limit: number;
  offset: number;
}

export interface GraphSearchRequest {
  query: string;
  context?: GraphContext;
  filters?: GraphQuery;
}

export interface GraphSearchResult {
  entities: GraphNode[];
  relationships: GraphEdge[];
  context: GraphContext;
  relevanceScores: number[];
}

export interface GraphTraversalRequest {
  startEntityId: string;
  relationshipTypes: string[];
  maxDepth: number;
  context?: GraphContext;
}

export interface GraphTraversalResult {
  entities: GraphNode[];
  relationships: GraphEdge[];
  path: string[];
  context: GraphContext;
}

export interface GraphUpdateRequest {
  entities: GraphNode[];
  relationships: GraphEdge[];
  context?: GraphContext;
}

export interface GraphUpdateResponse {
  updatedEntities: GraphNode[];
  updatedRelationships: GraphEdge[];
  context: GraphContext;
}

export const getAiModels = async (): Promise<AiModel[]> => {
  const response = await window.__TAURI__.invoke('get_ai_models');
  return response as AiModel[];
};

export const getAiProviders = async (): Promise<AiProvider[]> => {
  const response = await window.__TAURI__.invoke('get_ai_providers');
  return response as AiProvider[];
};

export const getAiModelStatus = async (): Promise<any[]> => {
  const response = await window.__TAURI__.invoke('get_ai_model_status');
  return response as any[];
};

export const getAiProviderStatus = async (): Promise<any[]> => {
  const response = await window.__TAURI__.invoke('get_ai_provider_status');
  return response as any[];
};

export const sendAiRequest = async (request: AiRequest): Promise<AiResponse> => {
  const response = await window.__TAURI__.invoke('send_ai_request', { request });
  return response as AiResponse;
};

export const createAiChatSession = async (title: string): Promise<AiChatSession> => {
  const response = await window.__TAURI__.invoke('create_ai_chat_session', { title });
  return response as AiChatSession;
};

export const sendAiChatMessage = async (sessionId: string, message: string): Promise<AiChatMessage> => {
  const response = await window.__TAURI__.invoke('send_ai_chat_message', { sessionId, message });
  return response as AiChatMessage;
};

export const getAiChatHistory = async (sessionId: string): Promise<AiChatMessage[]> => {
  const response = await window.__TAURI__.invoke('get_ai_chat_history', { sessionId });
  return response as AiChatMessage[];
};

export const generateWorkflowSuggestions = async (request: WorkflowGenerationRequest): Promise<WorkflowSuggestion[]> => {
  const response = await window.__TAURI__.invoke('generate_workflow_suggestions', { request });
  return response as WorkflowSuggestion[];
};

export const getWorkflowContext = async (workspaceId?: string, projectId?: string, resourceId?: string): Promise<WorkflowContext> => {
  const response = await window.__TAURI__.invoke('get_workflow_context', { workspaceId, projectId, resourceId });
  return response as WorkflowContext;
};

export const getPluginContext = async (pluginId: string): Promise<PluginContext> => {
  const response = await window.__TAURI__.invoke('get_plugin_context', { pluginId });
  return response as PluginContext;
};

export const updatePluginCapability = async (request: PluginCapability): Promise<PluginCapability> => {
  const response = await window.__TAURI__.invoke('update_plugin_capability', { request });
  return response as PluginCapability;
};

export const updatePluginSetting = async (request: any): Promise<any> => {
  const response = await window.__TAURI__.invoke('update_plugin_setting', { request });
  return response as any;
};

// Agent-related API functions
export const getAgents = async (): Promise<Agent[]> => {
  const response = await window.__TAURI__.invoke('get_agents');
  return response as Agent[];
};

export const getAgent = async (id: string): Promise<Agent> => {
  const response = await window.__TAURI__.invoke('get_agent', { id });
  return response as Agent;
};

export const createAgent = async (agent: Agent): Promise<Agent> => {
  const response = await window.__TAURI__.invoke('create_agent', { agent });
  return response as Agent;
};

export const updateAgent = async (id: string, agent: Agent): Promise<Agent> => {
  const response = await window.__TAURI__.invoke('update_agent', { id, agent });
  return response as Agent;
};

export const deleteAgent = async (id: string): Promise<void> => {
  await window.__TAURI__.invoke('delete_agent', { id });
};

export const getAgentCapabilities = async (agentId: string): Promise<AgentCapability[]> => {
  const response = await window.__TAURI__.invoke('get_agent_capabilities', { agentId });
  return response as AgentCapability[];
};

export const executeAgentTask = async (request: AgentExecutionRequest): Promise<AgentExecutionResponse> => {
  const response = await window.__TAURI__.invoke('execute_agent_task', { request });
  return response as AgentExecutionResponse;
};

// Knowledge Graph API functions
export const searchGraph = async (request: GraphSearchRequest): Promise<GraphSearchResult> => {
  const response = await window.__TAURI__.invoke('search_graph', { request });
  return response as GraphSearchResult;
};

export const traverseGraph = async (request: GraphTraversalRequest): Promise<GraphTraversalResult> => {
  const response = await window.__TAURI__.invoke('traverse_graph', { request });
  return response as GraphTraversalResult;
};

export const updateGraph = async (request: GraphUpdateRequest): Promise<GraphUpdateResponse> => {
  const response = await window.__TAURI__.invoke('update_graph', { request });
  return response as GraphUpdateResponse;
};
