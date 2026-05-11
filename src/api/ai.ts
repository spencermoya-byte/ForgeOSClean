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
