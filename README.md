# Lightspeed Chatbot Reference UI

A reference implementation of a chatbot interface built with React, TypeScript, and PatternFly. This project demonstrates how to integrate AI-powered conversational interfaces with modern web applications using the PatternFly design system.

## ✨ Features

- **🤖 AI-Powered Chat**: Interactive chatbot with streaming responses
- **🔧 Tool Execution**: Visual feedback for AI tool usage and execution
- **📱 Multiple Display Modes**: Overlay, docked, and fullscreen modes
- **🔄 Model Selection**: Choose from available AI models
- **📚 Conversation History**: Persistent chat sessions with search
- **♿ Accessibility**: Full screen reader support and keyboard navigation
- **🎨 PatternFly Design**: Modern, consistent UI components
- **📱 Responsive**: Works on desktop and mobile devices

## 🚀 Quick Start

**Prerequisites**: Ensure the [lightspeed-stack](https://github.com/lightspeed-core/lightspeed-stack) is running to provide the backend API services.

If you need help getting `lightspeed-stack` running follow this [guide](https://github.com/lightspeed-core/lightspeed-stack/blob/main/docs/getting_started.md).

```bash
git clone https://github.com/your-org/lightspeed-reference-ui
cd lightspeed-reference-ui
npm install && npm run start:dev
```

The application will be available at `http://localhost:8080`

## 📋 Development Scripts

```sh
# Install development/build dependencies
npm install

# Start the development server
npm run start:dev

# Run a production build (outputs to "dist" dir)
npm run build

# Run the test suite
npm run test

# Run the test suite with coverage
npm run test:coverage

# Run the linter
npm run lint

# Run the code formatter
npm run format

# Launch a tool to inspect the bundle size
npm run bundle-profile:analyze

# Start the express server (run a production build first)
npm run start
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── LightspeedChatbot/           # Main chatbot module
│   │   ├── LightspeedChatbot.tsx    # Main chatbot component
│   │   ├── components/              # Reusable components
│   │   │   └── ToolExecutionCards.tsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useChatbot.ts
│   │   ├── services/                # API service layer
│   │   │   └── api.ts
│   │   ├── utils/                   # Helper functions
│   │   │   └── helpers.ts
│   │   ├── types.ts                 # TypeScript definitions
│   │   └── constants.ts             # Configuration constants
│   └── utils/                       # Shared utilities
│       └── useDocumentTitle.ts
├── index.html                       # HTML template
└── index.tsx                        # Application entry point
```

## 🔧 Configuration

### API Integration
The chatbot connects to a backend API that should provide:
- `GET /v1/models` - Available AI models
- `POST /v1/query` - Send chat messages
- `POST /v1/streaming_query` - Streaming chat responses

### Customization
Update `src/app/LightspeedChatbot/constants.ts` to configure:
- `API_BASE_URL`: Backend API endpoint (default: `http://localhost:8080`)
- `DEFAULT_SYSTEM_PROMPT`: AI behavior instructions
- `USER_AVATAR`, `BOT_AVATAR`: Avatar URLs for chat participants
- `FOOTNOTE_PROPS`: Footer disclaimer configuration

## 🎯 Key Components

### LightspeedChatbot
The main chatbot interface that provides:
- Chat message display with streaming
- Model selection dropdown
- Display mode switching (overlay/docked/fullscreen)
- Conversation history with search
- Tool execution visualization

### ToolExecutionCards
Displays active tool executions during AI processing:
- Shows tool names and status
- Provides visual feedback for long-running operations
- Automatically updates as tools complete

### useChatbot Hook
Custom React hook that manages:
- Chat state and message history
- API communication and streaming
- UI state (visibility, display modes)
- Model selection and loading

## 🔌 API Integration

The chatbot expects a backend API with these endpoints:

```typescript
// Get available models
GET /v1/models
Response: {
  models: Array<{
    identifier: string;
    metadata: Record<string, any>;
    api_model_type: string;
    provider_id: string;
    provider_resource_id: string;
    type: string;
    model_type: string;
  }>
}

// Send query (non-streaming)
POST /v1/query
Body: {
  query: string;
  conversation_id?: string;
  provider?: string;
  model?: string;
  system_prompt?: string;
  attachments?: Array<{
    attachment_type: string;
    content_type: string;
    content: string;
  }>;
}

// Send streaming query
POST /v1/streaming_query
Body: {
  query: string;
  conversation_id?: string;
  provider?: string;
  model?: string;
  system_prompt?: string;
  attachments?: Array<{
    attachment_type: string;
    content_type: string;
    content: string;
  }>;
}
Response: Server-Sent Events stream with events:
- start: { conversation_id: string }
- token: { id: number, role: string, token: string }
- tool_call: { id: number, role: string, token: string | Record<string, any> }
- end: { referenced_documents: any[], truncated: any, input_tokens: number, output_tokens: number }
```

## 📱 Usage Examples

### Basic Integration
```typescript
import { LightspeedChatbot } from './app/LightspeedChatbot';

function App() {
  return (
    <div className="app">
      <main>
        {/* Your app content */}
      </main>
      <LightspeedChatbot />
    </div>
  );
}
```


## 🧪 Testing

The project includes comprehensive tests:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Building

```bash
# Production build
npm run build

# Analyze bundle size
npm run bundle-profile:analyze
```

## 🔧 Development Tools

- **TypeScript**: Type safety and better development experience
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **Webpack**: Module bundling and development server

## 🌐 Browser Support

This application supports modern browsers with ES6+ features:
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
- Check the [Issues](https://github.com/lightspeed-core/lightspeed-reference-ui/issues) page
- Review the component documentation in `src/app/LightspeedChatbot/README.md`
- Refer to the [PatternFly documentation](https://www.patternfly.org/get-started/develop) for UI components
