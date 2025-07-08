import React from 'react';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { Bullseye, DropdownList, DropdownItem, DropdownGroup } from '@patternfly/react-core';

import ChatbotToggle from '@patternfly/chatbot/dist/dynamic/ChatbotToggle';
import Chatbot, { ChatbotDisplayMode } from '@patternfly/chatbot/dist/dynamic/Chatbot';
import ChatbotContent from '@patternfly/chatbot/dist/dynamic/ChatbotContent';
import ChatbotWelcomePrompt from '@patternfly/chatbot/dist/dynamic/ChatbotWelcomePrompt';
import ChatbotFooter, { ChatbotFootnote } from '@patternfly/chatbot/dist/dynamic/ChatbotFooter';
import MessageBar from '@patternfly/chatbot/dist/dynamic/MessageBar';
import MessageBox from '@patternfly/chatbot/dist/dynamic/MessageBox';
import Message, { MessageProps } from '@patternfly/chatbot/dist/dynamic/Message';
import ChatbotConversationHistoryNav, {
  Conversation
} from '@patternfly/chatbot/dist/dynamic/ChatbotConversationHistoryNav';
import ChatbotHeader, {
  ChatbotHeaderMenu,
  ChatbotHeaderMain,
  ChatbotHeaderTitle,
  ChatbotHeaderActions,
  ChatbotHeaderSelectorDropdown,
  ChatbotHeaderOptionsDropdown
} from '@patternfly/chatbot/dist/dynamic/ChatbotHeader';

import ExpandIcon from '@patternfly/react-icons/dist/esm/icons/expand-icon';
import OpenDrawerRightIcon from '@patternfly/react-icons/dist/esm/icons/open-drawer-right-icon';
import OutlinedWindowRestoreIcon from '@patternfly/react-icons/dist/esm/icons/outlined-window-restore-icon';

// No images used - using text placeholders instead

// API Configuration
const API_BASE_URL = 'http://localhost:8080';

// API types
interface Model {
  identifier: string;
  metadata: Record<string, any>;
  api_model_type: string;
  provider_id: string;
  provider_resource_id: string;
  type: string;
  model_type: string;
}

interface QueryRequest {
  query: string;
  conversation_id?: string;
  provider?: string;
  model?: string;
  system_prompt?: string;
  attachments?: Array<{
    attachment_type: string;
    content_type: string;
    content: string;
  }>;
}

interface QueryResponse {
  conversation_id?: string;
  response: string;
}

// API functions
const fetchModels = async (): Promise<Model[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/models`, {
        method: 'GET',
    });
    console.log('Models response status:', response.status);
    
    if (!response.ok) {
      console.error('Models API error:', response.status, response.statusText);
      throw new Error(`Failed to fetch models: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Models response data:', data);
    
    const models = data.models || [];
    console.log('Extracted models:', models);
    
    return models;
  } catch (error) {
    console.error('Error fetching models:', error);
    // Return some fallback models for testing
    return [
      {
        identifier: "test-model",
        metadata: {},
        api_model_type: "llm",
        provider_id: "test",
        provider_resource_id: "test-model",
        type: "model",
        model_type: "llm"
      }
    ];
  }
};

const sendQuery = async (request: QueryRequest): Promise<QueryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send query');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending query:', error);
    throw error;
  }
};

// Streaming types
interface StreamEvent {
  event: 'start' | 'token' | 'end';
  data: any;
}

interface StreamStartData {
  conversation_id: string;
}

interface StreamTokenData {
  id: number;
  role: string;
  token: string;
}

interface StreamEndData {
  referenced_documents: any[];
  truncated: any;
  input_tokens: number;
  output_tokens: number;
}

const sendStreamingQuery = async (
  request: QueryRequest,
  onToken: (token: string, tokenData?: StreamTokenData) => void,
  onStart: (conversationId: string) => void,
  onEnd: (endData: StreamEndData) => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/streaming_query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send streaming query');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('No reader available');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const eventData: StreamEvent = JSON.parse(line.slice(6));
            
            switch (eventData.event) {
              case 'start':
                const startData = eventData.data as StreamStartData;
                onStart(startData.conversation_id);
                break;
              case 'token':
                const tokenData = eventData.data as StreamTokenData;
                onToken(tokenData.token, tokenData);
                break;
              case 'end':
                const endData = eventData.data as StreamEndData;
                onEnd(endData);
                break;
            }
          } catch (parseError) {
            console.error('Error parsing streaming data:', parseError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error sending streaming query:', error);
    throw error;
  }
};

const footnoteProps = {
  label: 'Lightspeed uses AI. Check for mistakes.',
  popover: {
    title: 'Verify accuracy',
    description: `While Lightspeed strives for accuracy, there's always a possibility of errors. It's a good practice to verify critical information from reliable sources, especially if it's crucial for decision-making or actions.`,
    cta: {
      label: 'Got it',
      onClick: () => {}
    },
    link: {
      label: 'Learn more',
      url: 'https://www.redhat.com/'
    }
  }
};



const initialMessages: MessageProps[] = [];

const welcomePrompts = [
//  {
//    title: 'General Help',
//    message: 'What can you help me with?'
//  },
// {
//    title: 'Technical Questions',
//    message: 'I have a technical question about my system'
//  },
//  {
//    title: 'Best Practices',
//    message: 'What are some best practices for development?'
//  }
];

const initialConversations = {};

const LightspeedChatbot: React.FunctionComponent = () => {
  useDocumentTitle('Lightspeed Chatbot');
  
  const [chatbotVisible, setChatbotVisible] = React.useState<boolean>(false);
  const [displayMode, setDisplayMode] = React.useState<ChatbotDisplayMode>(ChatbotDisplayMode.default);
  const [messages, setMessages] = React.useState<MessageProps[]>(initialMessages);
  const [selectedModel, setSelectedModel] = React.useState<string>('');
  const [selectedProvider, setSelectedProvider] = React.useState<string>('');
  const [availableModels, setAvailableModels] = React.useState<Model[]>([]);
  const [isSendButtonDisabled, setIsSendButtonDisabled] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [conversations, setConversations] = React.useState<Conversation[] | { [key: string]: Conversation[] }>(
    initialConversations
  );
  const [announcement, setAnnouncement] = React.useState<string>();
  const [currentConversationId, setCurrentConversationId] = React.useState<string>('');
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);

  // Fetch available models on component mount
  React.useEffect(() => {
    const loadModels = async () => {
      const models = await fetchModels();
      setAvailableModels(models);
      // Set first LLM model as default
      const defaultModel = models.find(model => model.api_model_type === 'llm');
      if (defaultModel) {
        setSelectedModel(defaultModel.identifier);
        setSelectedProvider(defaultModel.provider_id);
      }
    };
    loadModels();
  }, []);

  // Auto-scrolls to the latest message
  React.useEffect(() => {
    // Scroll to bottom when new messages are added
    if (messages.length > 0) {
      scrollToBottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [messages]);

  const onSelectModel = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined
  ) => {
    setSelectedModel(value as string);
  };

  const onSelectDisplayMode = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined
  ) => {
    setDisplayMode(value as ChatbotDisplayMode);
  };

  // you will likely want to come up with your own unique id function; this is for demo purposes only
  const generateId = () => {
    const id = Date.now() + Math.random();
    return id.toString();
  };

  const handleSend = async (message: string | number) => {
    setIsSendButtonDisabled(true);
    const messageContent = String(message);
    const newMessages: MessageProps[] = [];
    // we can't use structuredClone since messages contains functions, but we can't mutate
    // items that are going into state or the UI won't update correctly
    messages.forEach((message) => newMessages.push(message));
    newMessages.push({ id: generateId(), role: 'user', content: messageContent, name: 'User', avatar: '' });
    
    const botMessageId = generateId();
    newMessages.push({
      id: botMessageId,
      role: 'bot',
      content: 'Lightspeed AI is processing your request...',
      name: 'Lightspeed AI',
      isLoading: true,
      avatar: ''
    });
    setMessages(newMessages);
    // make announcement to assistive devices that new messages have been added
    setAnnouncement(`Message from User: ${messageContent}. Message from Lightspeed AI is loading.`);

    try {
      const queryRequest: QueryRequest = {
        query: messageContent,
        conversation_id: currentConversationId || undefined,
        model: selectedModel || undefined,
        provider: selectedProvider || undefined,
        system_prompt: "You are a helpful assistant."
      };

      let streamingContent = '';
      let finalConversationId = currentConversationId;

      await sendStreamingQuery(
        queryRequest,
        // onToken callback
        (token: string, tokenData?: StreamTokenData) => {
          // Check if this is a tool execution token
          if (tokenData && tokenData.role === 'tool_execution') {
            // Format tool execution tokens with text formatting
            streamingContent += `\n📋 Using tool: *${token}*\n\n`;
          } else {
            streamingContent += token;
          }
          
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const botMessageIndex = updatedMessages.findIndex(msg => msg.id === botMessageId);
            if (botMessageIndex !== -1) {
              updatedMessages[botMessageIndex] = {
                ...updatedMessages[botMessageIndex],
                content: streamingContent,
                isLoading: false
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
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const botMessageIndex = updatedMessages.findIndex(msg => msg.id === botMessageId);
            if (botMessageIndex !== -1) {
              updatedMessages[botMessageIndex] = {
                ...updatedMessages[botMessageIndex],
                content: streamingContent,
                isLoading: false,
                actions: {
                  copy: { onClick: () => navigator.clipboard.writeText(streamingContent) },
                  share: { onClick: () => {} },
                  listen: { onClick: () => {} }
                }
              };
            }
            return updatedMessages;
          });
          // make announcement to assistive devices that new message has loaded
          setAnnouncement(`Message from Lightspeed AI: ${streamingContent}`);
        }
      );
    } catch (error) {
      console.error('Error sending streaming query:', error);
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const botMessageIndex = updatedMessages.findIndex(msg => msg.id === botMessageId);
        if (botMessageIndex !== -1) {
          updatedMessages[botMessageIndex] = {
            ...updatedMessages[botMessageIndex],
            content: 'Sorry, I encountered an error processing your request. Please try again.',
            isLoading: false,
            actions: {
              copy: { onClick: () => {} },
              share: { onClick: () => {} },
              listen: { onClick: () => {} }
            }
          };
        }
        return updatedMessages;
      });
      setAnnouncement(`Message from Lightspeed AI: Sorry, I encountered an error processing your request.`);
    } finally {
      setIsSendButtonDisabled(false);
    }
  };

  const findMatchingItems = (targetValue: string) => {
    // Since we start with empty conversations, return empty object
    return {};
  };

  const horizontalLogo = (
    <Bullseye>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Lightspeed</div>
    </Bullseye>
  );

  const iconLogo = (
    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>LS</div>
  );

  return (
    <>
      <ChatbotToggle
        tooltipLabel="Lightspeed Chatbot"
        isChatbotVisible={chatbotVisible}
        onToggleChatbot={() => setChatbotVisible(!chatbotVisible)}
      />
      
      <Chatbot isVisible={chatbotVisible} displayMode={displayMode}>
        <ChatbotConversationHistoryNav
          displayMode={displayMode}
          onDrawerToggle={() => {
            setIsDrawerOpen(!isDrawerOpen);
            setConversations(initialConversations);
          }}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          activeItemId="1"
          // eslint-disable-next-line no-console
          onSelectActiveItem={(e, selectedItem) => console.log(`Selected history item with id ${selectedItem}`)}
          conversations={conversations}
          onNewChat={() => {
            setIsDrawerOpen(!isDrawerOpen);
            setMessages([]);
            setConversations(initialConversations);
            setCurrentConversationId('');
          }}
          handleTextInputChange={(value: string) => {
            if (value === '') {
              setConversations(initialConversations);
            }
            // this is where you would perform search on the items in the drawer
            // and update the state
            const newConversations: { [key: string]: Conversation[] } = findMatchingItems(value);
            setConversations(newConversations);
          }}
          drawerContent={
            <>
              <ChatbotHeader>
                <ChatbotHeaderMain>
                  <ChatbotHeaderMenu aria-expanded={isDrawerOpen} onMenuToggle={() => setIsDrawerOpen(!isDrawerOpen)} />
                  <ChatbotHeaderTitle
                    displayMode={displayMode}
                    showOnFullScreen={horizontalLogo}
                    showOnDefault={iconLogo}
                  ></ChatbotHeaderTitle>
                </ChatbotHeaderMain>
                <ChatbotHeaderActions>
                  <ChatbotHeaderSelectorDropdown value={selectedModel} onSelect={onSelectModel}>
                    <DropdownList>
                      {availableModels
                        .filter(model => model.api_model_type === 'llm')
                        .map((model) => (
                          <DropdownItem value={model.identifier} key={model.identifier}>
                            {model.identifier}
                          </DropdownItem>
                        ))}
                      {availableModels.filter(model => model.api_model_type === 'llm').length === 0 && (
                        <DropdownItem value="" key="no-models" isDisabled>
                          No models available
                        </DropdownItem>
                      )}
                    </DropdownList>
                  </ChatbotHeaderSelectorDropdown>
                  <ChatbotHeaderOptionsDropdown onSelect={onSelectDisplayMode}>
                    <DropdownGroup label="Display mode">
                      <DropdownList>
                        <DropdownItem
                          value={ChatbotDisplayMode.default}
                          key="switchDisplayOverlay"
                          icon={<OutlinedWindowRestoreIcon aria-hidden />}
                          isSelected={displayMode === ChatbotDisplayMode.default}
                        >
                          <span>Overlay</span>
                        </DropdownItem>
                        <DropdownItem
                          value={ChatbotDisplayMode.docked}
                          key="switchDisplayDock"
                          icon={<OpenDrawerRightIcon aria-hidden />}
                          isSelected={displayMode === ChatbotDisplayMode.docked}
                        >
                          <span>Dock to window</span>
                        </DropdownItem>
                        <DropdownItem
                          value={ChatbotDisplayMode.fullscreen}
                          key="switchDisplayFullscreen"
                          icon={<ExpandIcon aria-hidden />}
                          isSelected={displayMode === ChatbotDisplayMode.fullscreen}
                        >
                          <span>Fullscreen</span>
                        </DropdownItem>
                      </DropdownList>
                    </DropdownGroup>
                  </ChatbotHeaderOptionsDropdown>
                </ChatbotHeaderActions>
              </ChatbotHeader>
              <ChatbotContent>
                {/* Update the announcement prop on MessageBox whenever a new message is sent
                 so that users of assistive devices receive sufficient context  */}
                <MessageBox announcement={announcement}>
                  <ChatbotWelcomePrompt
                    title="Hello, Lightspeed User"
                    description="How may I help you today?"
                    prompts={welcomePrompts}
                  />
                  {/* Display all messages */}
                  {messages.map((message) => (
                    <Message key={message.id} {...message} />
                  ))}
                  {/* Scroll reference at the bottom of all messages for proper streaming behavior */}
                  <div ref={scrollToBottomRef}></div>
                </MessageBox>
              </ChatbotContent>
              <ChatbotFooter>
                <MessageBar
                  onSendMessage={handleSend}
                  hasMicrophoneButton
                  isSendButtonDisabled={isSendButtonDisabled}
                />
                <ChatbotFootnote {...footnoteProps} />
              </ChatbotFooter>
            </>
          }
        ></ChatbotConversationHistoryNav>
      </Chatbot>
    </>
  );
};

export { LightspeedChatbot };
