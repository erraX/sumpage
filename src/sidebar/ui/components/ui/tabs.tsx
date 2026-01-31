/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import * as TabsPrimitive from '@radix-ui/react-tabs';

const Tabs = styled(TabsPrimitive.Root)`
  display: flex;
  flex-direction: column;
`;

const TabsList = styled(TabsPrimitive.List)`
  display: inline-flex;
  height: 40px;
  align-items: center;
  justify-content: center;
  background: #e3f0ee;
  padding: 4px;
  border-radius: 8px;
  gap: 4px;
`;

const TabsTrigger = styled(TabsPrimitive.Trigger)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s ease;
  cursor: pointer;
  background: transparent;
  border: none;
  color: #5d6b68;
  font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #2f6f6a;
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &[data-state='active'] {
    background: white;
    color: #1f2a2a;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
`;

const TabsContent = styled(TabsPrimitive.Content)`
  flex-grow: 1;
  outline: none;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #2f6f6a;
  }
`;

export { Tabs, TabsList, TabsTrigger, TabsContent };
