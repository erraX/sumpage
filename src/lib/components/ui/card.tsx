/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #d7e1dd;
  overflow: hidden;
  box-shadow: 0;
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2a2a;
  font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;
`;

const CardContent = styled.div`
  padding: 0 20px 20px;
`;

export { Card, CardHeader, CardTitle, CardContent };
