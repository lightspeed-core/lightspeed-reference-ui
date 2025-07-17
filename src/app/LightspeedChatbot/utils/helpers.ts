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
 * @param conversations The conversations to search through
 * @returns Matching conversations array
 */
export const findMatchingItems = (targetValue: string, conversations: Conversation[]): Conversation[] => {
  if (!targetValue.trim()) {
    return conversations;
  }

  return conversations.filter(
    (conversation) =>
      conversation.text?.toLowerCase().includes(targetValue.toLowerCase()) ||
      conversation.id?.toLowerCase().includes(targetValue.toLowerCase()),
  );
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
