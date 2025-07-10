import { MessageProps } from '@patternfly/chatbot/dist/dynamic/Message';
import { WelcomePrompt } from '@patternfly/chatbot/dist/dynamic/ChatbotWelcomePrompt';

// API Configuration
export const API_BASE_URL = 'http://localhost:8080';

// Avatar URLs
export const USER_AVATAR =
  'https://raw.githubusercontent.com/patternfly/chatbot/912cd12c09af5d8309ec2ac380076a4421368731/packages/module/patternfly-docs/content/extensions/chatbot/examples/Messages/user_avatar.svg';
export const BOT_AVATAR =
  'https://raw.githubusercontent.com/patternfly/chatbot/912cd12c09af5d8309ec2ac380076a4421368731/packages/module/patternfly-docs/content/extensions/chatbot/examples/Messages/patternfly_avatar.jpg';

// Initial states
export const INITIAL_MESSAGES: MessageProps[] = [];
export const INITIAL_WELCOME_PROMPTS: WelcomePrompt[] = [];
export const INITIAL_CONVERSATIONS = {};

// Default system prompt
export const DEFAULT_SYSTEM_PROMPT = 'You are a helpful assistant.';

// Footnote configuration
export const FOOTNOTE_PROPS = {
  label: 'Lightspeed uses AI. Check for mistakes.',
  popover: {
    title: 'Verify accuracy',
    description: `While Lightspeed strives for accuracy, there's always a possibility of errors. It's a good practice to verify critical information from reliable sources, especially if it's crucial for decision-making or actions.`,
    cta: {
      label: 'Got it',
      onClick: () => {},
    },
    link: {
      label: 'Learn more',
      url: 'https://www.redhat.com/',
    },
  },
};
