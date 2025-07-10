import React from 'react';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { Bullseye, DropdownList, DropdownItem, DropdownGroup, Title, TitleSizes, Flex } from '@patternfly/react-core';

// Chatbot components
import ChatbotToggle from '@patternfly/chatbot/dist/dynamic/ChatbotToggle';
import Chatbot, { ChatbotDisplayMode } from '@patternfly/chatbot/dist/dynamic/Chatbot';
import ChatbotContent from '@patternfly/chatbot/dist/dynamic/ChatbotContent';
import ChatbotWelcomePrompt from '@patternfly/chatbot/dist/dynamic/ChatbotWelcomePrompt';
import ChatbotFooter, { ChatbotFootnote } from '@patternfly/chatbot/dist/dynamic/ChatbotFooter';
import MessageBar from '@patternfly/chatbot/dist/dynamic/MessageBar';
import MessageBox from '@patternfly/chatbot/dist/dynamic/MessageBox';
import Message from '@patternfly/chatbot/dist/dynamic/Message';
import ChatbotConversationHistoryNav from '@patternfly/chatbot/dist/dynamic/ChatbotConversationHistoryNav';
import ChatbotHeader, {
  ChatbotHeaderMenu,
  ChatbotHeaderMain,
  ChatbotHeaderTitle,
  ChatbotHeaderActions,
  ChatbotHeaderSelectorDropdown,
  ChatbotHeaderOptionsDropdown
} from '@patternfly/chatbot/dist/dynamic/ChatbotHeader';

// Icons
import ExpandIcon from '@patternfly/react-icons/dist/esm/icons/expand-icon';
import OpenDrawerRightIcon from '@patternfly/react-icons/dist/esm/icons/open-drawer-right-icon';
import OutlinedWindowRestoreIcon from '@patternfly/react-icons/dist/esm/icons/outlined-window-restore-icon';

// Local imports
import { useChatbot } from './hooks/useChatbot';
import { ToolExecutionCards } from './components/ToolExecutionCards';
import { FOOTNOTE_PROPS, INITIAL_WELCOME_PROMPTS, INITIAL_CONVERSATIONS } from './constants';
import { findMatchingItems } from './utils/helpers';
import { Conversation } from '@patternfly/chatbot/dist/dynamic/ChatbotConversationHistoryNav';

/**
 * Main Lightspeed Chatbot Component
 * 
 * This component provides a complete chatbot interface with:
 * - Model selection
 * - Streaming responses
 * - Tool execution tracking
 * - Conversation history
 * - Multiple display modes (overlay, docked, fullscreen)
 */
const LightspeedChatbot: React.FunctionComponent = () => {
  useDocumentTitle('Lightspeed Chatbot');
  
  // Use the custom hook for all chatbot logic
  const {
    chatbotVisible,
    displayMode,
    messages,
    selectedModel,
    availableModels,
    isSendButtonDisabled,
    isDrawerOpen,
    conversations,
    announcement,
    toolExecutions,
    scrollToBottomRef,
    onSelectModel,
    onSelectDisplayMode,
    onToggleChatbot,
    onDrawerToggle,
    onNewChat,
    handleTextInputChange,
    handleSend,
    setChatbotVisible,
    setMessages,
    setConversations,
    setCurrentConversationId,
    setIsDrawerOpen
  } = useChatbot();

  // Enhanced message rendering with tool execution support
  const renderMessages = () => {
    return messages.map((message) => {
      const messageId = message.id || '';
      const messageToolExecutions = toolExecutions[messageId] || [];      
      const messageWithToolExecutions = {
        ...message,
        extraContent: messageToolExecutions.length > 0 ? {
          beforeMainContent: <ToolExecutionCards tools={messageToolExecutions} />
        } : undefined
      };
      
      return <Message key={messageId} {...messageWithToolExecutions} />;
    });
  };

  // Logo components
  const horizontalLogo = (
    <Bullseye>
      <Title headingLevel="h1" size={TitleSizes.lg}>
        Lightspeed Core
      </Title>
    </Bullseye>
  );

  const iconLogo = (
    <Title headingLevel="h1" size={TitleSizes.md}>
      LSC
    </Title>
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
            setConversations(INITIAL_CONVERSATIONS);
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
            setConversations(INITIAL_CONVERSATIONS);
            setCurrentConversationId('');
          }}
          handleTextInputChange={(value: string) => {
            if (value === '') {
              setConversations(INITIAL_CONVERSATIONS);
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
                          Overlay
                        </DropdownItem>
                        <DropdownItem
                          value={ChatbotDisplayMode.docked}
                          key="switchDisplayDock"
                          icon={<OpenDrawerRightIcon aria-hidden />}
                          isSelected={displayMode === ChatbotDisplayMode.docked}
                        >
                          Dock to window
                        </DropdownItem>
                        <DropdownItem
                          value={ChatbotDisplayMode.fullscreen}
                          key="switchDisplayFullscreen"
                          icon={<ExpandIcon aria-hidden />}
                          isSelected={displayMode === ChatbotDisplayMode.fullscreen}
                        >
                          Fullscreen
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
                    prompts={INITIAL_WELCOME_PROMPTS}
                  />
                  {/* Display all messages */}
                  {renderMessages()}
                  {/* Scroll reference at the bottom of all messages for proper streaming behavior */}
                  <div ref={scrollToBottomRef}/>
                </MessageBox>
              </ChatbotContent>
              <ChatbotFooter>
                <MessageBar
                  onSendMessage={handleSend}
                  hasMicrophoneButton
                  isSendButtonDisabled={isSendButtonDisabled}
                />
                <ChatbotFootnote {...FOOTNOTE_PROPS} />
              </ChatbotFooter>
            </>
          }
        ></ChatbotConversationHistoryNav>
      </Chatbot>
    </>
  );
};

export { LightspeedChatbot };
