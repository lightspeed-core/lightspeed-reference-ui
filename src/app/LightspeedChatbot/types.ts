// Types for the Lightspeed Chatbot
export interface Model {
  identifier: string;
  metadata: Record<string, any>;
  api_model_type: string;
  provider_id: string;
  provider_resource_id: string;
  type: string;
  model_type: string;
}

export interface QueryRequest {
  query: string;
  conversation_id?: string;
  provider?: string;
  model?: string;
  no_tools?: boolean;
  system_prompt?: string;
  attachments?: Array<{
    attachment_type: string;
    content_type: string;
    content: string;
  }>;
}

export interface QueryResponse {
  conversation_id?: string;
  response: string;
}

// Conversation history types
export interface ConversationResponse {
  conversation_id: string;
  chat_history: Array<{
    messages: Array<{
      content: string;
      type: 'user' | 'assistant';
    }>;
    started_at: string;
    completed_at?: string;
  }>;
}

// Streaming types
export interface StreamEvent {
  event: 'start' | 'token' | 'tool_call' | 'end';
  data: any;
}

export interface StreamStartData {
  conversation_id: string;
}

export interface StreamTokenData {
  id: number;
  role: string;
  token: string;
}

export interface StreamToolCallData {
  id: number;
  role: string;
  token: string | Record<string, any>;
}

export interface StreamEndData {
  referenced_documents: Array<{
    doc_url: string;
    doc_title: string;
  }>;
  truncated: any;
  input_tokens: number;
  output_tokens: number;
}

// Component types
export interface ToolExecutionCardsProps {
  tools: string[];
}

export interface ChatbotState {
  chatbotVisible: boolean;
  displayMode: any;
  messages: any[];
  selectedModel: string;
  selectedProvider: string;
  availableModels: Model[];
  isSendButtonDisabled: boolean;
  isDrawerOpen: boolean;
  conversations: any;
  announcement?: string;
  currentConversationId: string;
  toolExecutions: { [messageId: string]: string[] };
}
