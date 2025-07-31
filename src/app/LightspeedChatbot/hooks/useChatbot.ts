import React from 'react';
import { ChatbotDisplayMode } from '@patternfly/chatbot/dist/dynamic/Chatbot';
import { MessageProps } from '@patternfly/chatbot/dist/dynamic/Message';
import { Conversation } from '@patternfly/chatbot/dist/dynamic/ChatbotConversationHistoryNav';
import { DropEvent, DropdownItem, DropdownList } from '@patternfly/react-core';

import { Model, QueryRequest, StreamTokenData, StreamEndData, ConversationResponse } from '../types';
import { INITIAL_MESSAGES, INITIAL_CONVERSATIONS, USER_AVATAR, BOT_AVATAR, DEFAULT_SYSTEM_PROMPT } from '../constants';
import { fetchModels, sendStreamingQuery, fetchConversation, deleteConversation } from '../services/api';
import { generateId, findMatchingItems, copyToClipboard } from '../utils/helpers';

export const useChatbot = () => {
  // Core state
  const [chatbotVisible, setChatbotVisible] = React.useState<boolean>(false);
  const [displayMode, setDisplayMode] = React.useState<ChatbotDisplayMode>(ChatbotDisplayMode.default);
  const [messages, setMessages] = React.useState<MessageProps[]>(INITIAL_MESSAGES);
  const [selectedModel, setSelectedModel] = React.useState<string>('');
  const [selectedProvider, setSelectedProvider] = React.useState<string>('');
  const [availableModels, setAvailableModels] = React.useState<Model[]>([]);
  const [isSendButtonDisabled, setIsSendButtonDisabled] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [conversations, setConversations] = React.useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [allConversations, setAllConversations] = React.useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [announcement, setAnnouncement] = React.useState<string>();
  const [currentConversationId, setCurrentConversationId] = React.useState<string>('');
  const [toolExecutions, setToolExecutions] = React.useState<{ [messageId: string]: string[] }>({});

  // Attachment state - now supports multiple files
  const [attachedFiles, setAttachedFiles] = React.useState<File[]>([]);
  const [isLoadingFile, setIsLoadingFile] = React.useState<boolean>(false);
  const [fileError, setFileError] = React.useState<string | undefined>();
  const [showFileAlert, setShowFileAlert] = React.useState<boolean>(false);

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

  // Load conversation messages when a conversation is selected
  const loadConversationMessages = async (conversationId: string) => {
    if (!conversationId) return;

    try {
      const conversationData: ConversationResponse = await fetchConversation(conversationId);

      // Convert API response to MessageProps format
      const convertedMessages: MessageProps[] = [];

      for (const chatEntry of conversationData.chat_history) {
        for (const message of chatEntry.messages) {
          const messageId = generateId();
          const messageProps: MessageProps = {
            id: messageId,
            role: message.type === 'user' ? 'user' : 'bot',
            content: message.content,
            name: message.type === 'user' ? 'User' : 'Lightspeed AI',
            avatar: message.type === 'user' ? USER_AVATAR : BOT_AVATAR,
            isLoading: false,
          };

          if (message.type === 'assistant') {
            messageProps.actions = {
              copy: { onClick: () => copyToClipboard(message.content) },
              share: { onClick: () => {} },
              listen: { onClick: () => {} },
            };
          }

          convertedMessages.push(messageProps);
        }
      }

      setMessages(convertedMessages);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setAnnouncement('Failed to load conversation. Please try again.');
    }
  };

  // Remove a conversation from the list
  const removeConversation = async (conversationId: string) => {
    try {
      // Call the API to delete the conversation
      await deleteConversation(conversationId);

      // Update local state after successful API call
      setAllConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));

      // If we're deleting the current conversation, clear the messages and conversation ID
      if (currentConversationId === conversationId) {
        setMessages([]);
        setCurrentConversationId('');
      }

      setAnnouncement('Conversation removed successfully.');
      console.log('Conversation removed successfully.');
    } catch (error) {
      console.error('Error removing conversation:', error);
      setAnnouncement('Failed to remove conversation. Please try again.');
    }
  };

  // Add a conversation to the list (when a new conversation is created)
  const addConversation = (conversationId: string, firstMessage: string) => {
    const newConversation: Conversation = {
      id: conversationId,
      text: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : ''),
      menuItems: [
        React.createElement(DropdownList, {
          key: 'list-1',
          children: React.createElement(
            DropdownItem,
            {
              value: 'Delete',
              id: 'Delete',
              onClick: () => removeConversation(conversationId),
            },
            'Delete',
          ),
        }),
      ],
    };

    setAllConversations((prev) => [newConversation, ...prev]);
    setConversations((prev) => [newConversation, ...prev]);
  };

  // Selection handlers
  const onSelectModel = (_event?: React.MouseEvent, value?: string | number) => {
    setSelectedModel(value as string);
  };

  const onSelectDisplayMode = (_event?: React.MouseEvent, value?: string | number) => {
    setDisplayMode(value as ChatbotDisplayMode);
  };

  const onToggleChatbot = () => {
    setChatbotVisible(!chatbotVisible);
  };

  const onDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const onNewChat = () => {
    setIsDrawerOpen(!isDrawerOpen);
    setMessages([]);
    setCurrentConversationId('');
  };

  const handleTextInputChange = (value: string) => {
    // Search conversations based on input
    const newConversations = findMatchingItems(value, allConversations);
    setConversations(newConversations);
  };

  const handleConversationSelect = (conversationId: string) => {
    loadConversationMessages(conversationId);
    setIsDrawerOpen(false);
  };

  // File handling
  const readFile = (file: File) =>
    new Promise<string | ArrayBuffer | null>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = (fileArr: File[]) => {
    setIsLoadingFile(true);

    // Validate total file count (max 5 files)
    if (attachedFiles.length + fileArr.length > 5) {
      setShowFileAlert(true);
      setFileError('Maximum 5 files allowed. Please remove some files before adding more.');
      setIsLoadingFile(false);
      return;
    }

    // Validate each file size (25MB limit)
    for (const file of fileArr) {
      if (file.size > 25000000) {
        setShowFileAlert(true);
        setFileError(`File "${file.name}" is too large. File size must be less than 25MB.`);
        setIsLoadingFile(false);
        return;
      }
    }

    // Check for duplicate files
    const duplicateFiles = fileArr.filter((newFile) =>
      attachedFiles.some((existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size),
    );

    if (duplicateFiles.length > 0) {
      setShowFileAlert(true);
      setFileError(`File "${duplicateFiles[0].name}" is already attached.`);
      setIsLoadingFile(false);
      return;
    }

    // Process all files
    Promise.all(fileArr.map((file) => readFile(file)))
      .then(() => {
        setAttachedFiles((prev) => [...prev, ...fileArr]);
        setShowFileAlert(false);
        setFileError(undefined);
        // Simulate loading delay for better UX
        setTimeout(() => {
          setIsLoadingFile(false);
        }, 500);
      })
      .catch((error: DOMException) => {
        setFileError(`Failed to read files: ${error.message}`);
        setShowFileAlert(true);
        setIsLoadingFile(false);
      });
  };

  const handleAttach = (files: File[]) => {
    handleFile(files);
  };

  const handleFileDrop = (event: DropEvent, files: File[]) => {
    handleFile(files);
  };

  const onAttachmentClose = (fileIndex: number) => {
    setAttachedFiles((prev) => prev.filter((_, index) => index !== fileIndex));
  };

  const onCloseFileAlert = () => {
    setShowFileAlert(false);
    setFileError(undefined);
  };



  const handleSend = async (message: string | number) => {
    setIsSendButtonDisabled(true);
    const messageContent = String(message);

    // Read file contents if attachments exist
    let fileContents: string[] = [];
    if (attachedFiles.length > 0) {
      try {
        const fileContentPromises = attachedFiles.map((file) => readFile(file));
        const contents = await Promise.all(fileContentPromises);
        fileContents = contents.map((content) => content as string);
      } catch (error) {
        console.error('Error reading files:', error);
        setFileError('Failed to read file content');
        setShowFileAlert(true);
        setIsSendButtonDisabled(false);
        return;
      }
    }

    // Create new messages array with user message
    const newMessages: MessageProps[] = [...messages];
    const userMessage: MessageProps = {
      id: generateId(),
      role: 'user',
      content: messageContent,
      name: 'User',
      avatar: USER_AVATAR,
      isLoading: false,
    };

    // Add attachment information if files are attached
    if (attachedFiles.length > 0 && fileContents.length > 0) {
      userMessage.attachments = attachedFiles.map((file, index) => ({
        name: file.name,
        id: generateId(),
        // No onClose callback for sent attachments - they should be permanent
      }));
    }

    console.log(userMessage);
    newMessages.push(userMessage);

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

    // Clear attachments from footer after sending
    if (attachedFiles.length > 0 && fileContents.length > 0) {
      setAttachedFiles([]);
      setIsLoadingFile(false);
    }

    try {
      const queryRequest: QueryRequest = {
        query: messageContent,
        conversation_id: currentConversationId || undefined,
        model: selectedModel || undefined,
        provider: selectedProvider || undefined,
        system_prompt: DEFAULT_SYSTEM_PROMPT,
        attachments:
          attachedFiles.length > 0 && fileContents.length > 0
            ? attachedFiles.map((file, index) => ({
                attachment_type: 'log',
                content_type: file.type,
                content: fileContents[index],
              }))
            : undefined,
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

          // Add conversation to list if it's a new one
          if (!currentConversationId && conversationId) {
            addConversation(conversationId, messageContent);
          }
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
                sources: endData.referenced_documents && endData.referenced_documents.length > 0 ? {
                  sources: endData.referenced_documents.map(doc => ({
                    title: doc.doc_title,
                    link: doc.doc_url,
                  })),
                } : undefined,
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
    // Core state
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

    // Attachment state - updated for multiple files
    attachedFiles,
    isLoadingFile,
    fileError,
    showFileAlert,

    // Actions
    onSelectModel,
    onSelectDisplayMode,
    onToggleChatbot,
    onDrawerToggle,
    onNewChat,
    handleTextInputChange,
    handleConversationSelect,
    handleSend,

    // Attachment actions
    handleAttach,
    handleFileDrop,
    onAttachmentClose,
    onCloseFileAlert,

    // Setters (for direct state updates)
    setChatbotVisible,
    setMessages,
    setConversations,
    setCurrentConversationId,
    setIsDrawerOpen,
  };
};
