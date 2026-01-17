import apiClient from './client.js';
import { API_URL } from '../../config/api.js';

export interface ChatMessageRequest {
  message: string;
  name: string;
  id?: string;
}

export interface ConversationResponse {
  success: boolean;
  data: {
    id: string;
    name: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    messages: Array<{
      role: 'USER' | 'AGENT';
      content: string;
      agentType?: 'SUPPORT' | 'ORDER' | 'BILLING';
    }>;
  };
  error?: string;
}

export interface ConversationListResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    messages: Array<{
      role: 'USER' | 'AGENT';
      content: string;
      agentType?: 'SUPPORT' | 'ORDER' | 'BILLING';
      createdAt: string;
    }>;
  }>;
  error?: string;
}

export interface DeleteConversationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const chatService = {
  async sendMessage(request: ChatMessageRequest): Promise<Response> {
    const response = await fetch(`${API_URL}/api/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to send message' }));
      throw new Error(error.error || 'Failed to send message');
    }

    return response;
  },

  async getConversation(id: string): Promise<ConversationResponse> {
    const response = await apiClient.get<ConversationResponse>(`/api/chat/conversations/${id}`);
    return response.data;
  },

  async getAllConversations(): Promise<ConversationListResponse> {
    const response = await apiClient.get<ConversationListResponse>('/api/chat/conversations');
    return response.data;
  },

  async deleteConversation(id: string): Promise<DeleteConversationResponse> {
    const response = await apiClient.delete<DeleteConversationResponse>(`/api/chat/conversations/${id}`);
    return response.data;
  },
};

