import styled from '@emotion/styled';

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

export const ProviderTabsContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

// Form
export const ProviderFormGroup = styled.div`
  margin-bottom: 16px;
`;

// Layout
export const ProviderContainer = styled.div`
  padding: 16px;
`;

export const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  margin-top: 24px;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

export const AdvancedToggle = styled.button`
  background: none;
  border: none;
  color: ${theme.accent};
  font-family: ${theme.font};
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-top: 8px;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${theme.accent};
    outline-offset: 2px;
    border-radius: 4px;
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

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

export const EmptyState = styled.p`
  color: ${theme.muted};
  font-size: 14px;
  text-align: center;
  margin: 0;
`;
