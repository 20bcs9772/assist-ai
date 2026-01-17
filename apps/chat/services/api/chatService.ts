import { rpcClient } from './rpcClient.js';
import { API_URL } from '../../config/api.js';

export interface ChatMessageRequest {
  message: string;
  name: string;
  id?: string;
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

  async getConversation(id: string) {
    const res = await rpcClient['api']['chat']['conversations'][':id'].$get({
      param: { id },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to fetch conversation' }));
      throw new Error(error.error || 'Failed to fetch conversation');
    }

    return res.json();
  },

  async getAllConversations() {
    const res = await rpcClient['api']['chat']['conversations'].$get();

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to fetch conversations' }));
      throw new Error(error.error || 'Failed to fetch conversations');
    }

    return res.json();
  },

  async deleteConversation(id: string) {
    const res = await rpcClient['api']['chat']['conversations'][':id'].$delete({
      param: { id },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to delete conversation' }));
      throw new Error(error.error || 'Failed to delete conversation');
    }

    return res.json();
  },
};

