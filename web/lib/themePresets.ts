export type ThemePreset = {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
};

export const themePresets: ThemePreset[] = [
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#1d4ed8',
      secondary: '#9333ea',
      background: '#ffffff',
      text: '#111827',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#f472b6',
      background: '#111827',
      text: '#ffffff',
    },
  },
];
