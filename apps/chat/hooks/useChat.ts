import { useState, useCallback, useEffect } from 'react';
import { Message, Conversation, ChatState } from '../types';
import { chatService } from '../services/api/chatService.js';
import { streamChatMessage } from '../services/sse/chatStreamService.js';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeChatId: null,
    isSidebarOpen: true,
    streamingStatus: 'idle',
    isThinking: false,
    isLoading: true,
  });

  const activeChat = state.conversations.find(c => c.id === state.activeChatId);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await chatService.getAllConversations();
      if (response.success && response.data) {
        const conversations: Conversation[] = response.data.map((conv) => ({
          id: conv.id,
          name: conv.name || 'Unnamed Conversation',
          messages: conv.messages.map((msg, idx) => ({
            id: `${conv.id}-msg-${idx}`,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(conv.createdAt).getTime(),
            agentType: msg.agentType,
          })),
          lastMessage: conv.messages[conv.messages.length - 1]?.content.substring(0, 50) + '...',
          active: conv.active,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        }));

        setState(prev => ({
          ...prev,
          conversations,
          activeChatId: conversations.length > 0 ? conversations[0].id : null,
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const setActiveChat = async (id: string) => {
    try {
      setState(prev => ({ ...prev, isLoadingConversation: true }));
      const response = await chatService.getConversation(id);
      if (response.success && response.data) {
        const conv = response.data;
        const conversation: Conversation = {
          id: conv.id,
          name: conv.name || 'Unnamed Conversation',
          messages: conv.messages.map((msg, idx) => ({
            id: `${conv.id}-msg-${idx}`,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(conv.createdAt).getTime(),
            agentType: msg.agentType,
          })),
          lastMessage: conv.messages[conv.messages.length - 1]?.content.substring(0, 50) + '...',
          active: conv.active,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };

        setState(prev => ({
          ...prev,
          conversations: prev.conversations.map(c => c.id === id ? conversation : c),
          activeChatId: id,
          isLoadingConversation: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoadingConversation: false }));
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setState(prev => ({ ...prev, isLoadingConversation: false }));
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const response = await chatService.deleteConversation(id);
      if (response.success) {
        setState(prev => {
          const newConversations = prev.conversations.filter(c => c.id !== id);
          const nextActiveId = newConversations.length > 0 ? newConversations[0].id : null;
          return {
            ...prev,
            conversations: newConversations,
            activeChatId: prev.activeChatId === id ? nextActiveId : prev.activeChatId
          };
        });
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const startNewChat = (name: string = "New Conversation") => {
    const newId = `temp-${Date.now()}`;
    const newChat: Conversation = {
      id: newId,
      name,
      messages: [],
      lastMessage: 'New chat started'
    };
    setState(prev => ({
      ...prev,
      conversations: [newChat, ...prev.conversations],
      activeChatId: newId,
    }));
    return newId;
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!state.activeChatId || !content.trim()) return;

    const activeChat = state.conversations.find(c => c.id === state.activeChatId);
    const userName = activeChat?.name || 'User';

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'USER',
      content,
      timestamp: Date.now(),
    };

    const currentChatId = state.activeChatId;
    const isNewChat = currentChatId?.startsWith('temp-') || false;
    const chatIdForRequest = isNewChat ? '' : currentChatId;

    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => 
        c.id === currentChatId 
          ? { ...c, messages: [...c.messages, userMessage], lastMessage: content }
          : c
      ),
      streamingStatus: 'loading',
      isThinking: true,
    }));

    const agentMessageId = `a-${Date.now()}`;
    let agentMessageAdded = false;
    let fullContent = '';
    let receivedChatId: string | null = null;
    let isFirstChunk = true;

    try {
      for await (const chunk of streamChatMessage(content, userName, chatIdForRequest || undefined)) {
        if (chunk.type === 'thinking' || (isFirstChunk && chunk.type === 'content' && !chunk.data)) {
          setState(prev => ({ ...prev, isThinking: true }));
          isFirstChunk = false;
          continue;
        }

        if (chunk.type === 'content' && chunk.data) {
          if (!agentMessageAdded) {
            agentMessageAdded = true;
            const agentMessage: Message = {
              id: agentMessageId,
              role: 'AGENT',
              content: '',
              timestamp: Date.now(),
              isStreaming: true,
            };
            setState(prev => ({
              ...prev,
              streamingStatus: 'streaming',
              isThinking: false,
              conversations: prev.conversations.map(c => 
                c.id === currentChatId 
                  ? { ...c, messages: [...c.messages, agentMessage] }
                  : c
              )
            }));
          }

          fullContent += chunk.data;
          const chatIdToUse = receivedChatId || currentChatId;
          setState(prev => ({
            ...prev,
            conversations: prev.conversations.map(c => 
              c.id === chatIdToUse 
                ? { 
                    ...c, 
                    messages: c.messages.map(m => 
                      m.id === agentMessageId ? { ...m, content: fullContent } : m
                    ) 
                  }
                : c
            )
          }));
        }

        if (chunk.type === 'done') {
          if (chunk.data) {
            receivedChatId = chunk.data;
            if (isNewChat && receivedChatId) {
              setState(prev => {
                const updatedConversations = prev.conversations.map(c => 
                  c.id === currentChatId ? { ...c, id: receivedChatId! } : c
                );
                return {
                  ...prev,
                  conversations: updatedConversations,
                  activeChatId: receivedChatId!,
                };
              });
            }
          }
          
          if (!agentMessageAdded && fullContent.trim()) {
            const agentMessage: Message = {
              id: agentMessageId,
              role: 'AGENT',
              content: fullContent,
              timestamp: Date.now(),
              isStreaming: false,
            };
            const finalChatId = receivedChatId || currentChatId;
            setState(prev => ({
              ...prev,
              streamingStatus: 'idle',
              isThinking: false,
              conversations: prev.conversations.map(c => 
                c.id === finalChatId
                  ? { 
                      ...c, 
                      messages: [...c.messages, agentMessage],
                      lastMessage: fullContent.substring(0, 50) + (fullContent.length > 50 ? '...' : ''),
                    }
                  : c
              )
            }));
            return;
          }
          break;
        }

        if (chunk.type === 'error') {
          throw new Error(chunk.data || 'Stream error');
        }
      }

      const finalChatId = receivedChatId || currentChatId;
      setState(prev => ({
        ...prev,
        streamingStatus: 'idle',
        isThinking: false,
        conversations: prev.conversations.map(c => 
          c.id === finalChatId
            ? { 
                ...c, 
                lastMessage: fullContent.substring(0, 50) + (fullContent.length > 50 ? '...' : ''),
                messages: c.messages.map(m => 
                  m.id === agentMessageId ? { ...m, isStreaming: false, content: fullContent || m.content } : m
                ) 
              }
            : c
        )
      }));

    } catch (error) {
      console.error("Failed to stream:", error);
      setState(prev => {
        const hasAgentMessage = prev.conversations.some(c => 
          c.id === currentChatId && c.messages.some(m => m.id === agentMessageId)
        );
        
        if (!hasAgentMessage && !agentMessageAdded) {
          const errorMessage: Message = {
            id: agentMessageId,
            role: 'AGENT',
            content: 'Sorry, an error occurred. Please try again.',
            timestamp: Date.now(),
            isStreaming: false,
          };
          return {
            ...prev,
            streamingStatus: 'error',
            isThinking: false,
            conversations: prev.conversations.map(c => 
              c.id === currentChatId 
                ? { ...c, messages: [...c.messages, errorMessage] }
                : c
            )
          };
        }
        
        return {
          ...prev,
          streamingStatus: 'error',
          isThinking: false,
          conversations: prev.conversations.map(c => 
            c.id === currentChatId 
              ? { 
                  ...c, 
                  messages: c.messages.map(m => 
                    m.id === agentMessageId 
                      ? { ...m, content: fullContent || 'Sorry, an error occurred. Please try again.', isStreaming: false }
                      : m
                  ) 
                }
              : c
          )
        };
      });
    }
  }, [state.activeChatId, state.conversations]);

  return {
    ...state,
    activeChat,
    setActiveChat,
    deleteConversation,
    startNewChat,
    sendMessage,
    toggleSidebar: () => setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen })),
    refreshConversations: loadConversations,
  };
}
