export interface Theme {
  name: string;
  label: string;
  variables: Record<string, string>;
}

export const themes: Theme[] = [
  {
    name: 'matrix',
    label: 'Matrix Green (Default)',
    variables: {
      '--background': '0 0% 3.9%',
      '--foreground': '120 14.3% 85.5%',
      '--card': '0 0% 3.9%',
      '--card-foreground': '120 14.3% 85.5%',
      '--primary': '142.1 76.2% 36.3%',
      '--primary-foreground': '355.7 100% 97.3%',
      '--secondary': '0 0% 14.9%',
      '--secondary-foreground': '120 14.3% 85.5%',
      '--muted': '0 0% 14.9%',
      '--muted-foreground': '120 14.3% 40%',
      '--accent': '0 0% 14.9%',
      '--accent-foreground': '120 14.3% 85.5%',
      '--destructive': '0 84.2% 60.2%',
      '--border': '0 0% 14.9%',
      '--input': '0 0% 14.9%',
      '--ring': '142.1 76.2% 36.3%',
    },
  },
  {
    name: 'dracula',
    label: 'Dracula',
    variables: {
      '--background': '231 15% 18%',
      '--foreground': '60 30% 96%',
      '--card': '231 15% 18%',
      '--card-foreground': '60 30% 96%',
      '--primary': '265 89% 78%',
      '--primary-foreground': '231 15% 18%',
      '--secondary': '232 14% 31%',
      '--secondary-foreground': '60 30% 96%',
      '--muted': '232 14% 31%',
      '--muted-foreground': '225 27% 51%',
      '--accent': '232 14% 31%',
      '--accent-foreground': '60 30% 96%',
      '--destructive': '0 100% 67%',
      '--border': '232 14% 31%',
      '--input': '232 14% 31%',
      '--ring': '265 89% 78%',
    },
  },
  {
    name: 'catppuccin',
    label: 'Catppuccin Mocha',
    variables: {
      '--background': '240 21% 15%',
      '--foreground': '226 64% 88%',
      '--card': '240 21% 15%',
      '--card-foreground': '226 64% 88%',
      '--primary': '267 84% 81%',
      '--primary-foreground': '240 21% 15%',
      '--secondary': '237 16% 23%',
      '--secondary-foreground': '226 64% 88%',
      '--muted': '237 16% 23%',
      '--muted-foreground': '228 24% 45%',
      '--accent': '237 16% 23%',
      '--accent-foreground': '226 64% 88%',
      '--destructive': '343 81% 75%',
      '--border': '237 16% 23%',
      '--input': '237 16% 23%',
      '--ring': '267 84% 81%',
    },
  },
  {
    name: 'nord',
    label: 'Nord',
    variables: {
      '--background': '220 16% 22%',
      '--foreground': '218 27% 92%',
      '--card': '220 16% 22%',
      '--card-foreground': '218 27% 92%',
      '--primary': '193 43% 67%',
      '--primary-foreground': '220 16% 22%',
      '--secondary': '220 16% 28%',
      '--secondary-foreground': '218 27% 92%',
      '--muted': '220 16% 28%',
      '--muted-foreground': '219 28% 65%',
      '--accent': '220 16% 28%',
      '--accent-foreground': '218 27% 92%',
      '--destructive': '354 42% 56%',
      '--border': '220 16% 28%',
      '--input': '220 16% 28%',
      '--ring': '193 43% 67%',
    },
  },
  {
    name: 'retro-amber',
    label: 'Retro Amber',
    variables: {
      '--background': '30 100% 4%',
      '--foreground': '36 100% 55%',
      '--card': '30 100% 4%',
      '--card-foreground': '36 100% 55%',
      '--primary': '36 100% 50%',
      '--primary-foreground': '30 100% 4%',
      '--secondary': '30 50% 12%',
      '--secondary-foreground': '36 100% 55%',
      '--muted': '30 50% 12%',
      '--muted-foreground': '36 60% 35%',
      '--accent': '30 50% 12%',
      '--accent-foreground': '36 100% 55%',
      '--destructive': '0 84% 60%',
      '--border': '30 50% 12%',
      '--input': '30 50% 12%',
      '--ring': '36 100% 50%',
    },
  },
  {
    name: 'cyberpunk',
    label: 'Cyberpunk',
    variables: {
      '--background': '260 20% 6%',
      '--foreground': '180 100% 70%',
      '--card': '260 20% 6%',
      '--card-foreground': '180 100% 70%',
      '--primary': '320 100% 60%',
      '--primary-foreground': '260 20% 6%',
      '--secondary': '260 20% 14%',
      '--secondary-foreground': '180 100% 70%',
      '--muted': '260 20% 14%',
      '--muted-foreground': '180 40% 40%',
      '--accent': '260 20% 14%',
      '--accent-foreground': '180 100% 70%',
      '--destructive': '0 100% 60%',
      '--border': '260 20% 14%',
      '--input': '260 20% 14%',
      '--ring': '320 100% 60%',
    },
  },
];

export function applyTheme(themeName: string): boolean {
  const theme = themes.find(t => t.name === themeName);
  if (!theme) return false;

  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.variables)) {
    root.style.setProperty(key, value);
  }
  localStorage.setItem('terminal-theme', themeName);
  return true;
}

export function loadSavedTheme(): string {
  const saved = localStorage.getItem('terminal-theme');
  if (saved) {
    applyTheme(saved);
    return saved;
  }
  return 'matrix';
}
