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