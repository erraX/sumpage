/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const Badge = styled.div<BadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;
  transition: all 0.15s ease;
  border: 1px solid transparent;

  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: #f6f2ea;
          color: #1f2a2a;
          border-color: #d7e1dd;
        `;
      case 'destructive':
        return `
          background: #fff0ec;
          color: #b44635;
          border-color: #f2b8a8;
        `;
      case 'outline':
        return `
          background: transparent;
          color: #1f2a2a;
          border-color: #d7e1dd;
        `;
      default:
        return `
          background: #2f6f6a;
          color: white;
          border-color: #2f6f6a;
        `;
    }
  }}
`;

Badge.displayName = 'Badge';

export { Badge };
