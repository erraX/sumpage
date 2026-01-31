import React from 'react';
import { Alert as MuiAlert, type AlertProps as MuiAlertProps, Typography } from '@mui/material';

interface AlertProps extends Omit<MuiAlertProps, 'severity' | 'variant'> {
  variant?: 'default' | 'destructive' | 'success';
}

function Alert({ variant = 'default', children, ...rest }: AlertProps) {
  const severity =
    variant === 'destructive' ? 'error' : variant === 'success' ? 'success' : 'info';

  const mergedSx = Array.isArray(rest.sx)
    ? [{ alignItems: 'flex-start' }, ...rest.sx]
    : [{ alignItems: 'flex-start' }, rest.sx].filter(Boolean);

  return (
    <MuiAlert
      severity={severity}
      variant="outlined"
      icon={false}
      {...rest}
      sx={mergedSx}
    >
      {children}
    </MuiAlert>
  );
}

function AlertTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography component="h4" variant="subtitle2" fontWeight={600} mb={0.5}>
      {children}
    </Typography>
  );
}

function AlertDescription({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="body2" lineHeight={1.5}>
      {children}
    </Typography>
  );
}

export { Alert, AlertTitle, AlertDescription };
