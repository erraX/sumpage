/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { css } from '@emotion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const buttonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.15s ease;
  cursor: pointer;
  font-family: 'Space Grotesk', 'Trebuchet MS', sans-serif;
  border: none;
  outline: none;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #2f6f6a;
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  &[data-variant='default'] {
    background: #2f6f6a;
    color: white;
    &:hover:not(:disabled) {
      background: #235652;
    }
  }

  &[data-variant='destructive'] {
    background: #b44635;
    color: white;
    &:hover:not(:disabled) {
      background: #d45540;
    }
  }

  &[data-variant='outline'] {
    background: white;
    border: 1px solid #d7e1dd;
    color: #1f2a2a;
    &:hover:not(:disabled) {
      background: #f6f2ea;
    }
  }

  &[data-variant='ghost'] {
    background: transparent;
    &:hover:not(:disabled) {
      background: #e3f0ee;
    }
  }

  &[data-variant='link'] {
    background: transparent;
    color: #2f6f6a;
    text-decoration: underline;
    text-underline-offset: 4px;
    &:hover:not(:disabled) {
      text-decoration: underline;
    }
  }

  &[data-size='default'] {
    height: 40px;
    padding: 0 16px;
  }

  &[data-size='sm'] {
    height: 36px;
    padding: 0 12px;
    border-radius: 6px;
    font-size: 13px;
  }

  &[data-size='lg'] {
    height: 44px;
    padding: 0 32px;
    border-radius: 8px;
  }

  &[data-size='icon'] {
    height: 40px;
    width: 40px;
  }
`;

const Button = styled.button<ButtonProps & { className?: string }>`
  ${buttonStyles}
  &.sumpage-button { height: auto; padding: 0; }
  &.sumpage-button-default { background: #2f6f6a; color: white; }
  &.sumpage-button-destructive { background: #b44635; color: white; }
`;

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
