export type ThemeToken = {
  colors: {
    primary: string;
    background: string;
    text: string;
    border: string;
    accent: string;
  };
  radius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  font: {
    family: string;
    size: number;
  };
};

export const themePresets: Record<string, ThemeToken> = {
  Minimal: {
    colors: {
      primary: '#3b82f6',
      background: '#ffffff',
      text: '#111827',
      border: '#e5e7eb',
      accent: '#3b82f6',
    },
    radius: { none: 0, sm: 2, md: 4, lg: 8 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    font: { family: 'Inter, sans-serif', size: 16 },
  },
  Pop: {
    colors: {
      primary: '#d946ef',
      background: '#fff1f2',
      text: '#1f2937',
      border: '#fbcfe8',
      accent: '#f59e0b',
    },
    radius: { none: 0, sm: 4, md: 8, lg: 16 },
    spacing: { xs: 4, sm: 8, md: 20, lg: 28, xl: 40 },
    font: { family: 'Poppins, sans-serif', size: 18 },
  },
  Corporate: {
    colors: {
      primary: '#1e3a8a',
      background: '#f8fafc',
      text: '#0f172a',
      border: '#cbd5e1',
      accent: '#047857',
    },
    radius: { none: 0, sm: 2, md: 4, lg: 6 },
    spacing: { xs: 4, sm: 8, md: 12, lg: 20, xl: 24 },
    font: { family: 'Arial, sans-serif', size: 15 },
  },
};
