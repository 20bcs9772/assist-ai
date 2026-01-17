export type Role = 'USER' | 'AGENT';
export type AgentType = 'auto' | 'SUPPORT' | 'ORDER' | 'BILLING';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  agentType?: 'SUPPORT' | 'ORDER' | 'BILLING';
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  messages: Message[];
  lastMessage?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeChatId: string | null;
  isSidebarOpen: boolean;
  streamingStatus: 'idle' | 'loading' | 'streaming' | 'error';
  isThinking?: boolean;
  isLoading?: boolean;
  isLoadingConversation?: boolean;
}
