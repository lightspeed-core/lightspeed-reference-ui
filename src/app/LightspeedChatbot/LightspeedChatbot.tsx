import React from 'react';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { Bullseye, DropdownGroup, DropdownItem, DropdownList, Flex, FlexItem, Title, TitleSizes } from '@patternfly/react-core';

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
  ChatbotHeaderActions,
  ChatbotHeaderMain,
  ChatbotHeaderMenu,
  ChatbotHeaderOptionsDropdown,
  ChatbotHeaderSelectorDropdown,
  ChatbotHeaderTitle
} from '@patternfly/chatbot/dist/dynamic/ChatbotHeader';
import FileDropZone from '@patternfly/chatbot/dist/dynamic/FileDropZone';
import FileDetailsLabel from '@patternfly/chatbot/dist/dynamic/FileDetailsLabel';
import ChatbotAlert from '@patternfly/chatbot/dist/dynamic/ChatbotAlert';

// Icons
import ExpandIcon from '@patternfly/react-icons/dist/esm/icons/expand-icon';
import OpenDrawerRightIcon from '@patternfly/react-icons/dist/esm/icons/open-drawer-right-icon';
import OutlinedWindowRestoreIcon from '@patternfly/react-icons/dist/esm/icons/outlined-window-restore-icon';

// Local imports
import { useChatbot } from './hooks/useChatbot';
import { ToolExecutionCards } from './components/ToolExecutionCards';
import { FOOTNOTE_PROPS, INITIAL_WELCOME_PROMPTS } from './constants';

/**
 * Main Lightspeed Chatbot Component
 * 
 * This component provides a complete chatbot interface with:
 * - Model selection
 * - Streaming responses
 * - Tool execution tracking
 * - File attachments
 * - Conversation history
 * - Multiple display modes (overlay, docked, fullscreen)
 */
const LightspeedChatbot: React.FunctionComponent = () => {
  useDocumentTitle('Lightspeed Chatbot');
  
  const {
    chatbotVisible,
    displayMode,
    messages,
    selectedModel,
    availableModels,
    isSendButtonDisabled,
    isDrawerOpen,
    conversations,
    currentConversationId,
    announcement,
    toolExecutions,
    scrollToBottomRef,
    attachedFiles,
    isLoadingFile,
    fileError,
    showFileAlert,
    onSelectModel,
    onSelectDisplayMode,
    handleSend,
    handleAttach,
    handleFileDrop,
    onAttachmentClose,
    onCloseFileAlert,
    handleTextInputChange,
    handleConversationSelect,
    setChatbotVisible,
    setMessages,
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
          }}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          activeItemId={currentConversationId}
          onSelectActiveItem={(e, selectedItem) => {
            console.log(`Selected history item with id ${selectedItem}`);
            if (typeof selectedItem === 'string') {
              handleConversationSelect(selectedItem);
            }
          }}
          conversations={conversations}
          onNewChat={() => {
            setIsDrawerOpen(!isDrawerOpen);
            setMessages([]);
            setCurrentConversationId('');
          }}
          handleTextInputChange={handleTextInputChange}
          drawerContent={
            <>
              <ChatbotHeader>
                <ChatbotHeaderMain>
                  <ChatbotHeaderMenu aria-expanded={isDrawerOpen} onMenuToggle={() => setIsDrawerOpen(!isDrawerOpen)} />
                  <ChatbotHeaderTitle
                    displayMode={displayMode}
                    showOnFullScreen={horizontalLogo}
                    showOnDefault={iconLogo}
                  />
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
              <FileDropZone onFileDrop={handleFileDrop} displayMode={displayMode}>
                <ChatbotContent>
                  <MessageBox announcement={announcement}>
                    {showFileAlert && (
                      <ChatbotAlert
                        variant="danger"
                        onClose={onCloseFileAlert}
                        title="File upload failed"
                      >
                        {fileError}
                      </ChatbotAlert>
                    )}
                    <ChatbotWelcomePrompt
                      title="Hello, Lightspeed User"
                      description="How may I help you today?"
                      prompts={INITIAL_WELCOME_PROMPTS}
                    />
                    {renderMessages()}
                    <div ref={scrollToBottomRef}/>
                  </MessageBox>
                </ChatbotContent>
              </FileDropZone>
              <ChatbotFooter>
                <Flex 
                  direction={{ default: 'row' }}
                  flexWrap={{ default: 'nowrap' }} 
                  spaceItems={{ default: 'spaceItemsSm' }} 
                  style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '8px' }}
                >
                  {attachedFiles.map((file, index) => (
                    <FlexItem key={index} flex={{ default: 'flexNone' }}>
                      <FileDetailsLabel 
                        key={index} 
                        fileName={file.name} 
                        isLoading={isLoadingFile && index === attachedFiles.length - 1} 
                        onClose={() => onAttachmentClose(index)} 
                      />
                    </FlexItem>
                  ))}
                </Flex>
                <MessageBar
                  onSendMessage={handleSend}
                  handleAttach={handleAttach}
                  hasAttachButton
                  hasMicrophoneButton
                  isSendButtonDisabled={isSendButtonDisabled}
                />
                <ChatbotFootnote {...FOOTNOTE_PROPS} />
              </ChatbotFooter>
            </>
          }
        />
      </Chatbot>
    </>
  );
};

export { LightspeedChatbot };
