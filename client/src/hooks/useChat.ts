import { useState, useCallback } from 'react';
import { chatApi } from '../api/chat';
import type { ChatMessage } from '../types';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();

  const sendMessage = useCallback(
    async (content: string) => {
      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);

      // Add empty model message that will be filled
      const modelMessage: ChatMessage = {
        role: 'model',
        content: '',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, modelMessage]);

      try {
        for await (const chunk of chatApi.stream(content, sessionId)) {
          setMessages((prev) => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage && lastMessage.role === 'model') {
              updated[updated.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + chunk,
              };
            }
            return updated;
          });
        }
      } catch (error) {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            updated[updated.length - 1] = {
              ...lastMessage,
              content:
                error instanceof Error
                  ? `Error: ${error.message}`
                  : 'An error occurred. Please try again.',
            };
          }
          return updated;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (sessionId) {
      chatApi.clearHistory(sessionId).catch(console.error);
    }
  }, [sessionId]);

  const startNewSession = useCallback(() => {
    setMessages([]);
    setSessionId(undefined);
  }, []);

  return {
    messages,
    isStreaming,
    sessionId,
    sendMessage,
    clearMessages,
    startNewSession,
    setSessionId,
  };
};
