
import { Conversation } from './types';

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Gemini Assistant',
    avatar: 'https://picsum.photos/seed/gemini/200',
    messages: [
      {
        id: 'm1',
        role: 'AGENT',
        content: 'Hello! I am your AI assistant powered by Gemini. How can I help you today?',
        timestamp: Date.now() - 3600000,
      }
    ],
    lastMessage: 'Hello! I am your AI assistant...'
  },
  {
    id: '2',
    name: 'Product Support',
    avatar: 'https://picsum.photos/seed/support/200',
    messages: [
      {
        id: 'm2',
        role: 'AGENT',
        content: 'Hi there, do you have any questions about your current subscription?',
        timestamp: Date.now() - 86400000,
      }
    ],
    lastMessage: 'Hi there, do you have any questions...'
  }
];
