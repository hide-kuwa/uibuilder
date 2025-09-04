export type ThemeTokens = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
  fontSize: {
    sm: string;
    base: string;
    lg: string;
    xl: string;
  };
};

export const defaultTheme: ThemeTokens = {
  colors: {
    primary: '#1d4ed8',
    secondary: '#9333ea',
    background: '#ffffff',
    surface: '#f3f4f6',
    text: '#111827',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
  },
  fontSize: {
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
};

export default defaultTheme;
