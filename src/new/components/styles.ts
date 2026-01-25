import styled from '@emotion/styled';
import { css } from '@emotion/react';

const theme = {
  font: '"Space Grotesk", "Trebuchet MS", sans-serif',
  bg: '#f6f2ea',
  surface: '#ffffff',
  ink: '#1f2a2a',
  muted: '#5d6b68',
  accent: '#2f6f6a',
  accentStrong: '#235652',
  accentSoft: '#e3f0ee',
  border: '#d7e1dd',
  warningBg: '#fff0ec',
  warningBorder: '#f2b8a8',
  warningText: '#b44635',
  success: '#2f7a4f',
  successSoft: '#e6f4ec',
  white: '#f9fbfa',
};

// Provider Tabs
export const ProviderTabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

export const ProviderTabButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${theme.border};
  background: ${props => props.$active ? theme.accent : theme.white};
  color: ${props => props.$active ? theme.white : theme.ink};
  font-family: ${theme.font};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.$active ? theme.accentStrong : theme.accentSoft};
    border-color: ${theme.accent};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Form
export const ProviderFormGroup = styled.div`
  margin-bottom: 16px;
`;

export const ProviderLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.muted};
  margin-bottom: 6px;
`;

export const ProviderInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${theme.border};
  background: ${theme.white};
  font-family: ${theme.font};
  font-size: 14px;
  color: ${theme.ink};
  box-sizing: border-box;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${theme.accent};
    box-shadow: 0 0 0 3px ${theme.accentSoft};
  }

  &:disabled {
    background: ${theme.bg};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${theme.muted};
  }
`;

export const ProviderSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${theme.border};
  background: ${theme.white};
  font-family: ${theme.font};
  font-size: 14px;
  color: ${theme.ink};
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.accent};
    box-shadow: 0 0 0 3px ${theme.accentSoft};
  }
`;

// Buttons
const buttonBase = css`
  width: 100%;
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  font-family: ${theme.font};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
`;

export const ProviderButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  ${buttonBase}
  background: ${props => {
    switch (props.$variant) {
      case 'secondary': return theme.white;
      case 'danger': return theme.warningText;
      default: return theme.accent;
    }
  }};
  color: ${props => {
    switch (props.$variant) {
      case 'secondary': return theme.ink;
      default: return theme.white;
    }
  }};
  border: ${props => props.$variant === 'secondary' ? `1px solid ${theme.border}` : 'none'};

  &:hover:not(:disabled) {
    background: ${props => {
      switch (props.$variant) {
        case 'secondary': return theme.bg;
        case 'danger': return '#d45540';
        default: return theme.accentStrong;
      }
    }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

// Messages
export const ProviderError = styled.div`
  background: ${theme.warningBg};
  border: 1px solid ${theme.warningBorder};
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;

  p {
    margin: 0;
    color: ${theme.warningText};
    font-size: 13px;
  }
`;

export const ProviderSuccess = styled.div`
  background: ${theme.successSoft};
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;

  p {
    margin: 0;
    color: ${theme.success};
    font-size: 13px;
    font-weight: 500;
  }
`;

// Layout
export const ProviderContainer = styled.div`
  padding: 16px;
`;

export const ProviderContent = styled.div`
  background: ${theme.surface};
  border-radius: 12px;
  padding: 20px;
`;

export const ProviderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const ProviderTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${theme.ink};
  font-family: ${theme.font};
`;

export const AdvancedToggle = styled.button`
  background: none;
  border: none;
  color: ${theme.accent};
  font-family: ${theme.font};
  font-size: 13px;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

export const AdvancedSettings = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${theme.border};
`;

export const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;
