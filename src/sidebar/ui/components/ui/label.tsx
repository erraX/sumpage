import { FormLabel, type FormLabelProps, Typography } from '@mui/material';

export type LabelProps = FormLabelProps;

function Label({ children, ...rest }: LabelProps) {
  return (
    <FormLabel {...rest} sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
      <Typography component="span" variant="body2" fontWeight={600} color="inherit">
        {children}
      </Typography>
    </FormLabel>
  );
}

Label.displayName = 'Label';

export { Label };
