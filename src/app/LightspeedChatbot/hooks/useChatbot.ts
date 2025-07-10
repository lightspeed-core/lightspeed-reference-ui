import React from 'react';
import { ChatbotDisplayMode } from '@patternfly/chatbot/dist/dynamic/Chatbot';
import { MessageProps } from '@patternfly/chatbot/dist/dynamic/Message';
import { Conversation } from '@patternfly/chatbot/dist/dynamic/ChatbotConversationHistoryNav';

import { Model, QueryRequest, StreamTokenData, StreamEndData } from '../types';
import { INITIAL_MESSAGES, INITIAL_CONVERSATIONS, USER_AVATAR, BOT_AVATAR, DEFAULT_SYSTEM_PROMPT } from '../constants';
import { fetchModels, sendStreamingQuery } from '../services/api';
import { generateId, findMatchingItems, copyToClipboard } from '../utils/helpers';

export const useChatbot = () => {
  // State management
  const [chatbotVisible, setChatbotVisible] = React.useState<boolean>(false);
  const [displayMode, setDisplayMode] = React.useState<ChatbotDisplayMode>(ChatbotDisplayMode.default);
  const [messages, setMessages] = React.useState<MessageProps[]>(INITIAL_MESSAGES);
  const [selectedModel, setSelectedModel] = React.useState<string>('');
  const [selectedProvider, setSelectedProvider] = React.useState<string>('');
  const [availableModels, setAvailableModels] = React.useState<Model[]>([]);
  const [isSendButtonDisabled, setIsSendButtonDisabled] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [conversations, setConversations] = React.useState<Conversation[] | { [key: string]: Conversation[] }>(
    INITIAL_CONVERSATIONS,
  );
  const [announcement, setAnnouncement] = React.useState<string>();
  const [currentConversationId, setCurrentConversationId] = React.useState<string>('');
  const [toolExecutions, setToolExecutions] = React.useState<{ [messageId: string]: string[] }>({});

  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);

  // Load available models on component mount
  React.useEffect(() => {
    const loadModels = async () => {
      const models = await fetchModels();
      setAvailableModels(models);
      // Set first LLM model as default
      const defaultModel = models.find((model) => model.api_model_type === 'llm');
      if (defaultModel) {
        setSelectedModel(defaultModel.identifier);
        setSelectedProvider(defaultModel.provider_id);
      }
    };
    loadModels();
  }, []);

  // Auto-scroll to latest message
  React.useEffect(() => {
    if (messages.length > 0) {
      scrollToBottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [messages]);

  // Event handlers
  const onSelectModel = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    setSelectedModel(value as string);
  };

  const onSelectDisplayMode = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    setDisplayMode(value as ChatbotDisplayMode);
  };

  const onToggleChatbot = () => {
    setChatbotVisible(!chatbotVisible);
  };

  const onDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
    setConversations(INITIAL_CONVERSATIONS);
  };

  const onNewChat = () => {
    setIsDrawerOpen(!isDrawerOpen);
    setMessages([]);
    setConversations(INITIAL_CONVERSATIONS);
    setCurrentConversationId('');
  };

  const handleTextInputChange = (value: string) => {
    if (value === '') {
      setConversations(INITIAL_CONVERSATIONS);
      return;
    }
    // Search conversations based on input
    const newConversations = findMatchingItems(value);
    setConversations(newConversations);
  };

  const handleSend = async (message: string | number) => {
    setIsSendButtonDisabled(true);
    const messageContent = String(message);

    // Create new messages array with user message
    const newMessages: MessageProps[] = [...messages];
    newMessages.push({
      id: generateId(),
      role: 'user',
      content: messageContent,
      name: 'User',
      avatar: USER_AVATAR,
      isLoading: false,
    });

    // Add bot message placeholder
    const botMessageId = generateId();
    newMessages.push({
      id: botMessageId,
      role: 'bot',
      content: '',
      name: 'Lightspeed AI',
      isLoading: true,
      avatar: BOT_AVATAR,
    });

    setMessages(newMessages);
    setAnnouncement(`Message from User: ${messageContent}. Message from Lightspeed AI is loading.`);

    try {
      const queryRequest: QueryRequest = {
        query: messageContent,
        conversation_id: currentConversationId || undefined,
        model: selectedModel || undefined,
        provider: selectedProvider || undefined,
        system_prompt: DEFAULT_SYSTEM_PROMPT,
      };

      let streamingContent = '';
      let finalConversationId = currentConversationId;
      let currentToolExecutions: string[] = [];

      await sendStreamingQuery(
        queryRequest,
        // onToken callback
        (token: string, tokenData?: StreamTokenData) => {
          if (tokenData && tokenData.role === 'tool_execution') {
            currentToolExecutions.push(token);
            setToolExecutions((prev) => ({
              ...prev,
              [botMessageId]: [...currentToolExecutions],
            }));
          } else {
            streamingContent += token;
          }

          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const botMessageIndex = updatedMessages.findIndex((msg) => msg.id === botMessageId);
            if (botMessageIndex !== -1) {
              updatedMessages[botMessageIndex] = {
                ...updatedMessages[botMessageIndex],
                content: streamingContent,
                isLoading: false,
              };
            }
            return updatedMessages;
          });
        },
        // onStart callback
        (conversationId: string) => {
          finalConversationId = conversationId;
          setCurrentConversationId(conversationId);
        },
        // onEnd callback
        (endData: StreamEndData) => {
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const botMessageIndex = updatedMessages.findIndex((msg) => msg.id === botMessageId);
            if (botMessageIndex !== -1) {
              updatedMessages[botMessageIndex] = {
                ...updatedMessages[botMessageIndex],
                content: streamingContent,
                isLoading: false,
                actions: {
                  copy: { onClick: () => copyToClipboard(streamingContent) },
                  share: { onClick: () => {} },
                  listen: { onClick: () => {} },
                },
              };
            }
            return updatedMessages;
          });
          setAnnouncement(`Message from Lightspeed AI: ${streamingContent}`);
        },
      );
    } catch (error) {
      console.error('Error sending streaming query:', error);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const botMessageIndex = updatedMessages.findIndex((msg) => msg.id === botMessageId);
        if (botMessageIndex !== -1) {
          updatedMessages[botMessageIndex] = {
            ...updatedMessages[botMessageIndex],
            content: 'Sorry, I encountered an error processing your request. Please try again.',
            isLoading: false,
            actions: {
              copy: { onClick: () => {} },
              share: { onClick: () => {} },
              listen: { onClick: () => {} },
            },
          };
        }
        return updatedMessages;
      });
      setAnnouncement(`Message from Lightspeed AI: Sorry, I encountered an error processing your request.`);
    } finally {
      setIsSendButtonDisabled(false);
    }
  };

  return {
    // State
    chatbotVisible,
    displayMode,
    messages,
    selectedModel,
    selectedProvider,
    availableModels,
    isSendButtonDisabled,
    isDrawerOpen,
    conversations,
    announcement,
    currentConversationId,
    toolExecutions,
    scrollToBottomRef,

    // Actions
    onSelectModel,
    onSelectDisplayMode,
    onToggleChatbot,
    onDrawerToggle,
    onNewChat,
    handleTextInputChange,
    handleSend,

    // Setters (needed for direct state updates)
    setChatbotVisible,
    setDisplayMode,
    setMessages,
    setSelectedModel,
    setSelectedProvider,
    setAvailableModels,
    setIsSendButtonDisabled,
    setIsDrawerOpen,
    setConversations,
    setAnnouncement,
    setCurrentConversationId,
    setToolExecutions,
  };
};
