import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@patternfly/chatbot/dist/css/main.css';
import { LightspeedChatbot } from './LightspeedChatbot/LightspeedChatbot';

const App: React.FunctionComponent = () => (
  <Router>
    <LightspeedChatbot />
  </Router>
);

export default App;
