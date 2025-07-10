import React from 'react';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { ToolExecutionCardsProps } from '../types';

/**
 * Component for displaying tool execution cards
 * Shows which tools are being used during message processing
 */
export const ToolExecutionCards: React.FC<ToolExecutionCardsProps> = ({ tools }) => {
  if (tools.length === 0) {
    return null;
  }
  
  return (
    <React.Fragment>
      {tools.map((tool, index) => (
        <Card key={index} isCompact>
          <CardTitle>Tool Execution</CardTitle>
          <CardBody>
            Using tool: <strong>{tool}</strong>
          </CardBody>
        </Card>
      ))}
    </React.Fragment>
  );
}; 