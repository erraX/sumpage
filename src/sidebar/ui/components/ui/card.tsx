import React from 'react';
import {
  Card as MuiCard,
  CardContent as MuiCardContent,
  type CardProps as MuiCardProps,
  type CardContentProps as MuiCardContentProps,
  Box,
  Typography,
  type TypographyProps,
} from '@mui/material';

type CardProps = MuiCardProps;
type CardHeaderProps = React.ComponentProps<typeof Box>;
type CardTitleProps = TypographyProps;
type CardContentProps = MuiCardContentProps;

function Card(props: CardProps) {
  return <MuiCard variant="outlined" {...props} />;
}

function CardHeader(props: CardHeaderProps) {
  return <Box display="flex" flexDirection="column" gap={1} padding={2.5} {...props} />;
}

function CardTitle({ children, component = 'h3', sx, ...rest }: CardTitleProps) {
  return (
    <Typography
      variant="h6"
      component={component}
      fontWeight={600}
      sx={{ margin: 0, ...sx }}
      {...rest}
    >
      {children}
    </Typography>
  );
}

function CardContent(props: CardContentProps) {
  return <MuiCardContent sx={{ pt: 0, px: 2.5, pb: 2.5 }} {...props} />;
}

export { Card, CardHeader, CardTitle, CardContent };
