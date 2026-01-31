import { createTheme } from '@mui/material/styles';
import { theme as appTheme } from './theme';

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: appTheme.accent,
      dark: appTheme.accentStrong,
      light: appTheme.accentSoft,
      contrastText: '#ffffff',
    },
    secondary: {
      main: appTheme.muted,
    },
    error: {
      main: appTheme.warningText,
      light: appTheme.warningBorder,
    },
    success: {
      main: appTheme.success,
      light: appTheme.successSoft,
    },
    background: {
      default: appTheme.bg,
      paper: appTheme.surface,
    },
    text: {
      primary: appTheme.ink,
      secondary: appTheme.muted,
    },
    divider: appTheme.border,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: appTheme.font,
    h5: { fontSize: 18, fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: appTheme.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: appTheme.accent,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: appTheme.accent,
            boxShadow: `0 0 0 3px ${appTheme.accentSoft}`,
          },
        },
        input: {
          fontSize: 14,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          paddingTop: 10,
          paddingBottom: 10,
          fontSize: 14,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: `1px solid ${appTheme.border}`,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: appTheme.border,
        },
      },
    },
  },
});
