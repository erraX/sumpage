/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #5d6b68;
  margin-bottom: 6px;
  font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;
`;

Label.displayName = 'Label';

export { Label };
