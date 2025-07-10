import { Conversation } from '@patternfly/chatbot/dist/dynamic/ChatbotConversationHistoryNav';

/**
 * Generates a unique ID for messages
 * Note: This is a simple implementation for demo purposes
 * In production, consider using a more robust ID generation method
 */
export const generateId = (): string => {
  const id = Date.now() + Math.random();
  return id.toString();
};

/**
 * Finds matching conversation items based on search value
 * @param targetValue The search string
 * @returns Matching conversations object
 */
export const findMatchingItems = (targetValue: string): { [key: string]: Conversation[] } => {
  // Since we start with empty conversations, return empty object
  // In a real implementation, you would filter conversations based on targetValue
  return {};
};

/**
 * Copies text to clipboard
 * @param text Text to copy
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy text to clipboard:', error);
  }
}; 