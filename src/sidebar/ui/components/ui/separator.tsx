import { Divider, type DividerProps } from '@mui/material';

function Separator(props: DividerProps) {
  return <Divider {...props} sx={{ my: 2, ...props.sx }} />;
}

Separator.displayName = 'Separator';

export { Separator };
