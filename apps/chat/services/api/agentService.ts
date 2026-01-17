import apiClient from './client.js';

export interface AgentCapability {
  type: 'SUPPORT' | 'ORDER' | 'BILLING';
  description: string;
  capabilities: string[];
  tools?: string[];
}

export interface AgentListResponse {
  success: boolean;
  data: Array<{
    type: 'SUPPORT' | 'ORDER' | 'BILLING';
    description: string;
    capabilities: string[];
  }>;
  error?: string;
}

export interface AgentCapabilitiesResponse {
  success: boolean;
  data: AgentCapability;
  error?: string;
}

export const agentService = {
  async getAgents(): Promise<AgentListResponse> {
    const response = await apiClient.get<AgentListResponse>('/api/agents');
    return response.data;
  },

  async getAgentCapabilities(type: 'SUPPORT' | 'ORDER' | 'BILLING'): Promise<AgentCapabilitiesResponse> {
    const response = await apiClient.get<AgentCapabilitiesResponse>(`/api/agents/${type}/capabilities`);
    return response.data;
  },
};

