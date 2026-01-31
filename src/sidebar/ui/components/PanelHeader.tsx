import styled from '@emotion/styled';
import { theme } from '../theme';

interface PanelHeaderProps {
  onToggleSettings: () => void;
  onClose: () => void;
  settingPageVisible: boolean;
}

export function PanelHeader({
  onToggleSettings,
  onClose,
  settingPageVisible,
}: PanelHeaderProps) {
  return (
    <Header className='sumpage-panel-header'>
      <LeftGroup>
        <Title>Sumpage</Title>
        <IconButton
          type='button'
          className='sumpage-panel-btn'
          title='Settings'
          aria-pressed={settingPageVisible}
          $active={settingPageVisible}
          onClick={onToggleSettings}
        >
          ⚙
        </IconButton>
      </LeftGroup>
      <IconButton
        type='button'
        className='sumpage-panel-btn sumpage-panel-btn-close'
        title='Close'
        aria-label='Close sidebar'
        $variant='close'
        onClick={onClose}
      >
        ×
      </IconButton>
    </Header>
  );
}

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background: linear-gradient(160deg, #2f6f6a 0%, #3b837f 100%);
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: ${theme.white};
`;

const IconButton = styled.button<{
  $variant?: 'close';
  $active?: boolean;
}>`
  width: ${(props) => (props.$variant === 'close' ? '30px' : '28px')};
  height: ${(props) => (props.$variant === 'close' ? '30px' : '28px')};
  border-radius: ${(props) => (props.$variant === 'close' ? '10px' : '8px')};
  background: ${(props) =>
    props.$active
      ? 'rgba(255, 255, 255, 0.32)'
      : 'rgba(255, 255, 255, 0.18)'};
  border: 1px solid rgba(255, 255, 255, 0.22);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  font-size: ${(props) => (props.$variant === 'close' ? '16px' : '14px')};
  color: ${theme.white};

  &:hover {
    background: rgba(255, 255, 255, 0.28);
  }
`;
