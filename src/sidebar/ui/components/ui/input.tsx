/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = styled.input`
  flex: 1;
  height: 40px;
  width: 100%;
  border-radius: 10px;
  border: 1px solid #d7e1dd;
  background: #ffffff;
  padding: 0 12px;
  font-size: 14px;
  font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;
  color: #1f2a2a;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none;

  &::placeholder {
    color: #5d6b68;
  }

  &:focus {
    border-color: #2f6f6a;
    box-shadow: 0 0 0 3px #e3f0ee;
  }

  &:disabled {
    background: #f6f2ea;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

Input.displayName = 'Input';

export { Input };
