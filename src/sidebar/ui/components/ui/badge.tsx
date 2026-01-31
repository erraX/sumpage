import { Chip, type ChipProps } from '@mui/material';

interface BadgeProps extends Omit<ChipProps, 'variant' | 'color'> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function Badge({ variant = 'default', label, ...rest }: BadgeProps) {
  const color =
    variant === 'destructive'
      ? 'error'
      : variant === 'secondary'
        ? 'secondary'
        : 'primary';

  const muiVariant = variant === 'outline' ? 'outlined' : 'filled';

  return (
    <Chip
      size="small"
      color={color}
      variant={muiVariant}
      label={label}
      {...rest}
      sx={{ fontWeight: 600, ...rest.sx }}
    />
  );
}

export { Badge };
