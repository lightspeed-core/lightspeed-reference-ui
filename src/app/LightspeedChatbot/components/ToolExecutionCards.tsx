import React from 'react';
import { Card, CardBody, CardTitle, Flex, FlexItem } from '@patternfly/react-core';
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
    <Flex 
      direction={{ default: 'row' }}
      flexWrap={{ default: 'nowrap' }}
      spaceItems={{ default: 'spaceItemsSm' }}
      style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '8px' }}
    >
      {tools.map((tool, index) => (
        <FlexItem key={index} flex={{ default: 'flexNone' }}>
          <Card isCompact >
            <CardTitle>Tool Execution</CardTitle>
            <CardBody>
              Using tool: <strong>{tool}</strong>
            </CardBody>
          </Card>
        </FlexItem>
      ))}
    </Flex>
  );
}; 