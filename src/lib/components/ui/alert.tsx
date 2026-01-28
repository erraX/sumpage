/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success';
}

const AlertDiv = styled.div<AlertProps>`
  position: relative;
  width: 100%;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;

  ${props => {
    switch (props.variant) {
      case 'destructive':
        return `
          background: #fff0ec;
          border: 1px solid #f2b8a8;
          color: #b44635;
        `;
      case 'success':
        return `
          background: #e6f4ec;
          border: 1px solid #2f7a4f;
          color: #2f7a4f;
        `;
      default:
        return `
          background: #ffffff;
          border: 1px solid #d7e1dd;
          color: #1f2a2a;
        `;
    }
  }}
`;

const AlertTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;
`;

const AlertDescription = styled.div`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;

  p {
    margin: 0;
  }
`;

AlertDiv.displayName = 'Alert';

export { AlertDiv as Alert, AlertTitle, AlertDescription };
