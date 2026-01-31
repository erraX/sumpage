/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import * as SelectPrimitive from '@radix-ui/react-select';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = styled(SelectPrimitive.Trigger)`
  display: flex;
  height: 40px;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  border: 1px solid #d7e1dd;
  background: white;
  padding: 0 12px;
  font-size: 14px;
  color: #1f2a2a;
  cursor: pointer;
  font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;
  outline: none;
  transition: all 0.15s ease;

  &::placeholder {
    color: #5d6b68;
  }

  &:focus {
    border-color: #2f6f6a;
    box-shadow: 0 0 0 3px #e3f0ee;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  [data-placeholder] {
    color: #5d6b68;
  }
`;

const SelectScrollUpButton = styled.div`
  display: flex;
  cursor: default;
  align-items: center;
  justify-content: center;
  padding: 4px;
`;

const SelectScrollDownButton = styled.div`
  display: flex;
  cursor: default;
  align-items: center;
  justify-content: center;
  padding: 4px;
`;

const SelectContent = styled(SelectPrimitive.Content)`
  overflow: hidden;
  background: white;
  border-radius: 10px;
  border: 1px solid #d7e1dd;
  box-shadow: 0 4px 12px rgba(22, 52, 50, 0.15);
  position: relative;
  z-index: 9999;
`;

const SelectViewport = styled(SelectPrimitive.Viewport)`
  padding: 8px;
`;

const SelectItem = styled(SelectPrimitive.Item)`
  position: relative;
  display: flex;
  cursor: pointer;
  select: none;
  align-items: center;
  border-radius: 6px;
  padding: 8px 12px 8px 32px;
  font-size: 14px;
  outline: none;
  font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;
  color: #1f2a2a;

  &:focus {
    background: #e3f0ee;
    color: #235652;
  }

  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
`;

const SelectItemIndicator = styled(SelectPrimitive.ItemIndicator)`
  position: absolute;
  left: 8px;
  display: flex;
  height: 18px;
  width: 18px;
  align-items: center;
  justify-content: center;
`;

const SelectLabel = styled(SelectPrimitive.Label)`
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #5d6b68;
  font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;
`;

const SelectSeparator = styled(SelectPrimitive.Separator)`
  margin: 4px 8px;
  height: 1px;
  background: #d7e1dd;
`;

const SelectItemText = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
