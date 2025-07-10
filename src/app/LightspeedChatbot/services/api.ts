import { API_BASE_URL } from '../constants';
import {
  Model,
  QueryRequest,
  QueryResponse,
  StreamEvent,
  StreamStartData,
  StreamTokenData,
  StreamEndData,
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
    // Return fallback models for testing
    return [
      {
        identifier: 'test-model',
        metadata: {},
        api_model_type: 'llm',
        provider_id: 'test',
        provider_resource_id: 'test-model',
        type: 'model',
        model_type: 'llm',
      },
    ];
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
