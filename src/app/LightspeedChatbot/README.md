# Lightspeed Chatbot

A well-organized, modular chatbot implementation built with React and PatternFly.

## 📁 Project Structure

```
LightspeedChatbot/
├── README.md                    # This file
├── index.ts                     # Main exports
├── LightspeedChatbot.tsx        # Main component
├── types.ts                     # TypeScript type definitions
├── constants.ts                 # Configuration and constants
├── components/
│   └── ToolExecutionCards.tsx   # Tool execution display component
├── hooks/
│   └── useChatbot.ts           # Custom hook for chatbot logic
├── services/
│   └── api.ts                  # API service functions
└── utils/
    └── helpers.ts              # Utility functions
```

## 🧩 Components

### `LightspeedChatbot.tsx`
The main chatbot component that orchestrates all functionality:
- Uses the `useChatbot` hook for state management
- Renders the complete chatbot interface
- Handles tool execution display
- Supports multiple display modes (overlay, docked, fullscreen)

### `ToolExecutionCards.tsx`
A reusable component for displaying tool execution information:
- Shows which tools are being used during message processing
- Renders as compact cards with tool names
- Automatically hides when no tools are active

## 🎣 Hooks

### `useChatbot.ts`
A comprehensive custom hook that manages:
- **State**: Messages, models, conversations, UI states
- **Effects**: Model loading, auto-scrolling
- **Handlers**: Send messages, select models, toggle UI elements
- **API Integration**: Streaming query processing

## 🔧 Services

### `api.ts`
Centralized API service functions:
- `fetchModels()`: Retrieves available AI models
- `sendQuery()`: Sends non-streaming queries
- `sendStreamingQuery()`: Handles streaming responses with real-time updates

## 📝 Types

### `types.ts`
Complete TypeScript definitions:
- **API Types**: Model, QueryRequest, QueryResponse
- **Streaming Types**: StreamEvent, StreamTokenData, StreamEndData
- **Component Types**: Props and state interfaces

## 🔄 Utils

### `helpers.ts`
Utility functions:
- `generateId()`: Creates unique message IDs
- `findMatchingItems()`: Searches conversation history
- `copyToClipboard()`: Handles text copying

## 🎨 Constants

### `constants.ts`
Configuration values:
- API endpoints and avatars
- Initial state values
- UI configuration (footnotes, prompts)

## 🚀 Usage

```typescript
import { LightspeedChatbot } from './LightspeedChatbot';

function App() {
  return (
    <div>
      <LightspeedChatbot />
    </div>
  );
}
```

## 🔧 Configuration

### API Configuration
Update `constants.ts` to configure:
- `API_BASE_URL`: Your API endpoint
- `USER_AVATAR`, `BOT_AVATAR`: Avatar URLs
- `DEFAULT_SYSTEM_PROMPT`: AI behavior instructions

### Styling
The component uses PatternFly components and can be styled using:
- PatternFly CSS variables
- Custom CSS classes
- Inline styles for specific elements

## 📋 Features

- **Real-time Streaming**: Live response updates
- **Tool Execution Tracking**: Visual feedback for AI tool usage
- **Multiple Display Modes**: Overlay, docked, and fullscreen
- **Conversation History**: Persistent chat sessions
- **Model Selection**: Choose from available AI models
- **Accessibility**: Full screen reader support
- **Error Handling**: Graceful error recovery

## 🎯 Benefits of This Organization

1. **Separation of Concerns**: Each file has a single responsibility
2. **Reusability**: Components and hooks can be used independently
3. **Maintainability**: Easy to find and modify specific functionality
4. **Testability**: Each module can be tested in isolation
5. **Scalability**: Easy to add new features without cluttering
6. **Type Safety**: Comprehensive TypeScript definitions
7. **Documentation**: Clear structure and inline comments

## 🔍 Key Improvements Made

- ✅ **Modular Architecture**: Split large file into focused modules
- ✅ **Custom Hooks**: Extracted complex logic into reusable hooks
- ✅ **Type Safety**: Comprehensive TypeScript definitions
- ✅ **Service Layer**: Centralized API management
- ✅ **Utility Functions**: Shared helper functions
- ✅ **Constants Management**: Centralized configuration
- ✅ **Component Composition**: Smaller, focused components
- ✅ **Clear Documentation**: Comprehensive README and comments

This organization makes the codebase much easier to understand, maintain, and extend!

## 🎨 Frontend Customization Guide

### Overview
The Lightspeed Chatbot frontend is highly customizable, allowing you to tailor the experience to match your brand, requirements, and user preferences. This guide covers all available customization options.

---

### 🔧 Configuration Customization

#### Basic Configuration (`constants.ts`)
Modify the core configuration settings:

```typescript
// API Configuration
export const API_BASE_URL = 'https://your-api.domain.com';

// Avatar Customization
export const USER_AVATAR = 'https://your-domain.com/user-avatar.png';
export const BOT_AVATAR = 'https://your-domain.com/bot-avatar.png';

// Default AI Behavior
export const DEFAULT_SYSTEM_PROMPT = 'You are a specialized assistant for [YOUR USE CASE].';

// Footnote Customization
export const FOOTNOTE_PROPS = {
  label: 'Your App uses AI. Check for mistakes.',
  popover: {
    title: 'Custom Title',
    description: 'Your custom accuracy disclaimer...',
    cta: {
      label: 'Understood',
      onClick: () => { /* Custom action */ },
    },
    link: {
      label: 'Learn more',
      url: 'https://your-domain.com/ai-policy',
    },
  },
};
```

#### Welcome Prompts
Customize initial user interaction:

```typescript
export const INITIAL_WELCOME_PROMPTS: WelcomePrompt[] = [
  { title: 'Quick Start', message: 'Help me get started' },
  { title: 'Documentation', message: 'Show me the documentation' },
  { title: 'Support', message: 'I need technical support' },
];
```

---

### 🎭 Branding & Visual Identity

#### Logo Customization (`LightspeedChatbot.tsx`)
Replace the default logos with your brand:

```typescript
// Horizontal logo for fullscreen mode
const horizontalLogo = (
  <Bullseye>
    <img src="/your-logo-horizontal.svg" alt="Your Brand" height="40" />
  </Bullseye>
);

// Icon logo for compact modes
const iconLogo = (
  <img src="/your-logo-icon.svg" alt="YB" width="32" height="32" />
);
```

#### Welcome Message Customization
```typescript
<ChatbotWelcomePrompt
  title="Welcome to Your Assistant"
  description="How can I help you with [YOUR DOMAIN] today?"
  prompts={CUSTOM_WELCOME_PROMPTS}
/>
```

---

### 🔌 API Integration Customization

#### Custom Headers & Authentication
Modify `services/api.ts` to add custom headers:

```typescript
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`,
  'X-Custom-Header': 'your-value',
};

export const fetchModels = async (): Promise<Model[]> => {
  const response = await fetch(`${API_BASE_URL}/v1/models`, {
    method: 'GET',
    headers: defaultHeaders,
  });
  // ... rest of implementation
};
```

#### Custom Error Handling
```typescript
const handleApiError = (error: any, operation: string) => {
  console.error(`${operation} failed:`, error);
  // Custom error reporting
  if (window.errorReporting) {
    window.errorReporting.reportError(error, operation);
  }
  throw new Error(`${operation} failed. Please try again.`);
};
```

#### Response Transformation
```typescript
export const sendStreamingQuery = async (
  request: QueryRequest,
  onToken: (token: string, tokenData?: StreamTokenData) => void,
  onStart: (conversationId: string) => void,
  onEnd: (endData: StreamEndData) => void,
): Promise<void> => {
  // Custom request transformation
  const transformedRequest = {
    ...request,
    custom_field: 'your-value',
    user_context: getUserContext(),
  };
  
  // ... rest of implementation with custom processing
};
```

---

### 📱 UI/UX Customization

#### File Attachment Customization
Modify file handling rules:

```typescript
// Custom file validation
const validateCustomFile = (file: File): string | null => {
  const allowedTypes = ['.pdf', '.docx', '.txt', '.md', '.json'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (!allowedTypes.some(type => file.name.toLowerCase().endsWith(type))) {
    return `File type not supported. Allowed: ${allowedTypes.join(', ')}`;
  }
  
  if (file.size > maxSize) {
    return 'File too large. Maximum size: 50MB';
  }
  
  return null;
};
```

---

### 🔍 Advanced Features

#### Custom Tool Execution Display
Enhance the `ToolExecutionCards` component:

```typescript
// Enhanced tool execution with icons and descriptions
const TOOL_CONFIGS = {
  'web_search': { icon: 'search-icon', description: 'Searching the web...' },
  'file_analysis': { icon: 'file-icon', description: 'Analyzing document...' },
  'data_query': { icon: 'database-icon', description: 'Querying database...' },
};

export const EnhancedToolExecutionCards: React.FC<ToolExecutionCardsProps> = ({ tools }) => {
  return (
    <div className="custom-tool-execution">
      {tools.map((tool, index) => {
        const config = TOOL_CONFIGS[tool] || { icon: 'default-icon', description: tool };
        return (
          <Card key={index} className="tool-card">
            <Icon name={config.icon} />
            <span>{config.description}</span>
          </Card>
        );
      })}
    </div>
  );
};
```

### 💡 Best Practices

1. **Gradual Customization**: Start with configuration changes, then move to styling and advanced features
2. **Theme Consistency**: Maintain consistent styling across all components
3. **Accessibility**: Ensure customizations don't break accessibility features
4. **Performance**: Test that customizations don't impact performance
5. **Maintainability**: Document custom changes for future team members
6. **User Testing**: Validate customizations with real users
7. **Responsive Design**: Test customizations across different screen sizes
8. **Error Handling**: Implement robust error handling for custom features

This comprehensive customization guide provides you with all the tools needed to tailor the Lightspeed Chatbot to your specific requirements while maintaining code quality and user experience standards. 