import { forwardRef } from 'react';
import { OutlinedInput, type OutlinedInputProps } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export type InputProps = OutlinedInputProps;

const baseSx: SxProps<Theme> = {
  width: '100%',
  '& .MuiOutlinedInput-input': {
    padding: '10px 12px',
  },
};

const Input = forwardRef<HTMLInputElement, InputProps>(({ sx, ...rest }, ref) => {
  const mergedSx = Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx].filter(Boolean);

  return (
    <OutlinedInput
      inputRef={ref}
      fullWidth
      size="small"
      {...rest}
      sx={mergedSx}
    />
  );
});

Input.displayName = 'Input';

export { Input };
