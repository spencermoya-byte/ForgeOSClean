// Minimal valid API wrapper for AI functionality
export const getAiModels = async () => {
  const response = await window.__TAURI__.invoke('get_ai_models');
  return response;
};

export const getAiProviders = async () => {
  const response = await window.__TAURI__.invoke('get_ai_providers');
  return response;
};

export const getAiModelStatus = async () => {
  const response = await window.__TAURI__.invoke('get_ai_model_status');
  return response;
};

export const getAiProviderStatus = async () => {
  const response = await window.__TAURI__.invoke('get_ai_provider_status');
  return response;
};

export const sendAiRequest = async (request: any) => {
  const response = await window.__TAURI__.invoke('send_ai_request', { request });
  return response;
};

export const createAiChatSession = async (title: string) => {
  const response = await window.__TAURI__.invoke('create_ai_chat_session', { title });
  return response;
};

export const sendAiChatMessage = async (sessionId: string, message: string) => {
  const response = await window.__TAURI__.invoke('send_ai_chat_message', { sessionId, message });
  return response;
};

export const getAiChatHistory = async (sessionId: string) => {
  const response = await window.__TAURI__.invoke('get_ai_chat_history', { sessionId });
  return response;
};

export const generateWorkflowSuggestions = async (request: any) => {
  const response = await window.__TAURI__.invoke('generate_workflow_suggestions', { request });
  return response;
};

export const getWorkflowContext = async (workspaceId?: string, projectId?: string, resourceId?: string) => {
  const response = await window.__TAURI__.invoke('get_workflow_context', { workspaceId, projectId, resourceId });
  return response;
};

export const getPluginContext = async (pluginId: string) => {
  const response = await window.__TAURI__.invoke('get_plugin_context', { pluginId });
  return response;
};

export const updatePluginCapability = async (request: any) => {
  const response = await window.__TAURI__.invoke('update_plugin_capability', { request });
  return response;
};

export const updatePluginSetting = async (request: any) => {
  const response = await window.__TAURI__.invoke('update_plugin_setting', { request });
  return response;
};

// Agent-related API functions
export const getAgents = async () => {
  const response = await window.__TAURI__.invoke('get_agents');
  return response;
};

export const getAgent = async (id: string) => {
  const response = await window.__TAURI__.invoke('get_agent', { id });
  return response;
};

export const createAgent = async (agent: any) => {
  const response = await window.__TAURI__.invoke('create_agent', { agent });
  return response;
};

export const updateAgent = async (id: string, agent: any) => {
  const response = await window.__TAURI__.invoke('update_agent', { id, agent });
  return response;
};

export const deleteAgent = async (id: string) => {
  await window.__TAURI__.invoke('delete_agent', { id });
};

export const getAgentCapabilities = async (agentId: string) => {
  const response = await window.__TAURI__.invoke('get_agent_capabilities', { agentId });
  return response;
};

export const executeAgentTask = async (request: any) => {
  const response = await window.__TAURI__.invoke('execute_agent_task', { request });
  return response;
};

// Knowledge Graph API functions
export const searchGraph = async (request: any) => {
  const response = await window.__TAURI__.invoke('search_graph', { request });
  return response;
};

export const traverseGraph = async (request: any) => {
  const response = await window.__TAURI__.invoke('traverse_graph', { request });
  return response;
};

export const updateGraph = async (request: any) => {
  const response = await window.__TAURI__.invoke('update_graph', { request });
  return response;
};

// Filesystem Intelligence API functions
export const startFilesystemIndexing = async (request: any) => {
  const response = await window.__TAURI__.invoke('start_filesystem_indexing', { request });
  return response;
};

export const searchFilesystem = async (request: any) => {
  const response = await window.__TAURI__.invoke('search_filesystem', { request });
  return response;
};

export const getFilesystemContext = async (workspaceId: string, projectId?: string) => {
  const response = await window.__TAURI__.invoke('get_filesystem_context', { workspaceId, projectId });
  return response;
};

export const getFilesystemIndexingStatus = async (workspaceId: string, projectId?: string) => {
  const response = await window.__TAURI__.invoke('get_filesystem_indexing_status', { workspaceId, projectId });
  return response;
};
