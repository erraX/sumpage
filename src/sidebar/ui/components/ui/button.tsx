import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export type ButtonProps = Omit<MuiButtonProps, 'variant' | 'color' | 'size'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<
  ButtonVariant,
  { muiVariant: MuiButtonProps['variant']; color?: MuiButtonProps['color']; sx?: SxProps<Theme> }
> = {
  default: { muiVariant: 'contained', color: 'primary' },
  destructive: {
    muiVariant: 'contained',
    color: 'error',
    sx: { '&:hover': { backgroundColor: (theme) => theme.palette.error.dark } },
  },
  outline: { muiVariant: 'outlined', color: 'primary' },
  ghost: {
    muiVariant: 'text',
    color: 'primary',
    sx: {
      backgroundColor: 'transparent',
      '&:hover': { backgroundColor: (theme) => theme.palette.primary.light, opacity: 1 },
    },
  },
  link: {
    muiVariant: 'text',
    color: 'primary',
    sx: {
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
      minHeight: 'unset',
      padding: 0,
      '&:hover': { textDecoration: 'underline' },
    },
  },
};

const sizeStyles: Record<ButtonSize, MuiButtonProps['size']> = {
  default: 'medium',
  sm: 'small',
  lg: 'large',
  icon: 'medium',
};

function Button({ variant = 'default', size = 'default', sx, children, ...rest }: ButtonProps) {
  const selectedVariant = variantStyles[variant];
  const mergedSx: SxProps<Theme>[] = [];

  if (selectedVariant.sx) {
    mergedSx.push(selectedVariant.sx);
  }
  if (Array.isArray(sx)) {
    mergedSx.push(...sx);
  } else if (sx) {
    mergedSx.push(sx);
  }

  return (
    <MuiButton
      {...rest}
      variant={selectedVariant.muiVariant}
      color={selectedVariant.color}
      size={sizeStyles[size]}
      sx={
        [
          size === 'icon'
            ? {
                minWidth: 40,
                width: 40,
                height: 40,
                padding: 0,
              }
            : { minWidth: 0 },
          ...mergedSx,
        ] as SxProps<Theme>
      }
    >
      {children}
    </MuiButton>
  );
}

export { Button };
