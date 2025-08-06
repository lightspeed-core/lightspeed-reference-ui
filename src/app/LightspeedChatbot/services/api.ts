import { API_BASE_URL } from '../constants';
import {
  Model,
  QueryRequest,
  QueryResponse,
  StreamEvent,
  StreamStartData,
  StreamTokenData,
  StreamToolCallData,
  StreamEndData,
  ConversationResponse,
} from '../types';

/**
 * Fetches available models from the API
 * @returns Promise<Model[]> Array of available models
 */
export const fetchModels = async (): Promise<Model[]> => {
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
    return [];
  }
};

/**
 * Sends a query to the API (non-streaming)
 * @param request QueryRequest object
 * @returns Promise<QueryResponse>
 */
export const sendQuery = async (request: QueryRequest): Promise<QueryResponse> => {
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

/**
 * Sends a streaming query to the API
 * @param request QueryRequest object
 * @param onToken Callback for each token received
 * @param onStart Callback when streaming starts
 * @param onEnd Callback when streaming ends
 */
export const sendStreamingQuery = async (
  request: QueryRequest,
  onToken: (token: string, tokenData?: StreamTokenData) => void,
  onStart: (conversationId: string) => void,
  onEnd: (endData: StreamEndData) => void,
  onToolCall: (toolCallData: StreamToolCallData) => void,
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
              case 'tool_call':
                const toolCallData = eventData.data as StreamToolCallData;
                onToolCall(toolCallData);
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

/**
 * Fetches a conversation by ID from the API
 * @param conversationId The ID of the conversation to fetch
 * @returns Promise<ConversationResponse> The conversation data
 */
export const fetchConversation = async (conversationId: string): Promise<ConversationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/conversations/${conversationId}`, {
      method: 'GET',
    });

    console.log('Conversation response status:', response.status);

    if (!response.ok) {
      console.error('Conversation API error:', response.status, response.statusText);
      throw new Error(`Failed to fetch conversation: ${response.status}`);
    }

    const data = await response.json();
    console.log('Conversation response data:', data);

    return data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

/**
 * Deletes a conversation by ID from the API
 * @param conversationId The ID of the conversation to delete
 * @returns Promise<void>
 */
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/conversations/${conversationId}`, {
      method: 'DELETE',
    });

    console.log('Delete conversation response status:', response.status);

    if (!response.ok) {
      console.error('Delete conversation API error:', response.status, response.statusText);
      throw new Error(`Failed to delete conversation: ${response.status}`);
    }

    console.log('Conversation deleted successfully:', conversationId);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};
