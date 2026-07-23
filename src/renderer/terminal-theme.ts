import type { ITheme } from '@xterm/xterm';

export const darkTerminalTheme: ITheme = {
  background: '#0e0f13',
  foreground: '#e9eaf1',
  cursor: '#8588f2',
  selectionBackground: '#8588f259',
  black: '#0e0f13',
  red: '#e94560',
  green: '#0f9b58',
  yellow: '#f4b400',
  blue: '#4285f4',
  magenta: '#ab47bc',
  cyan: '#00acc1',
  white: '#e9eaf1',
  brightBlack: '#5d6172',
  brightRed: '#ff6b85',
  brightGreen: '#2dbf73',
  brightYellow: '#f6c453',
  brightBlue: '#6ea8ff',
  brightMagenta: '#c36be0',
  brightCyan: '#39d3e3',
  brightWhite: '#ffffff',
};

export const lightTerminalTheme: ITheme = {
  background: '#f7f7fb',
  foreground: '#1c1e26',
  cursor: '#5a5ee6',
  selectionBackground: '#5a5ee633',
  black: '#1c1e26',
  red: '#e94560',
  green: '#0f7a46',
  yellow: '#b07800',
  blue: '#1a5cbf',
  magenta: '#7b27a0',
  cyan: '#0080a0',
  white: '#6b7280',
  brightBlack: '#8b8b99',
  brightRed: '#c83f56',
  brightGreen: '#0b6a3d',
  brightYellow: '#8d6200',
  brightBlue: '#144c9f',
  brightMagenta: '#67208a',
  brightCyan: '#006c88',
  brightWhite: '#2c2c2c',
};

export const phpstormDarkTerminalTheme: ITheme = {
  background: '#2b2b2b',
  foreground: '#a9b7c6',
  cursor: '#bbbbbb',
  selectionBackground: '#21428380',
  black: '#000000',
  red: '#ff6b68',
  green: '#a8c023',
  yellow: '#f0c239',
  blue: '#6897bb',
  magenta: '#cc7832',
  cyan: '#287bde',
  white: '#a9b7c6',
};

export const solarizedLightTerminalTheme: ITheme = {
  background: '#fdf6e3',
  foreground: '#657b83',
  cursor: '#586e75',
  selectionBackground: '#eee8d5',
  black: '#073642',
  red: '#dc322f',
  green: '#859900',
  yellow: '#b58900',
  blue: '#268bd2',
  magenta: '#d33682',
  cyan: '#2aa198',
  white: '#eee8d5',
};

export const quietLightTerminalTheme: ITheme = {
  background: '#f5f5f5',
  foreground: '#333333',
  cursor: '#555555',
  selectionBackground: '#c9d0d940',
  black: '#333333',
  red: '#a31515',
  green: '#448c27',
  yellow: '#b58900',
  blue: '#325cc0',
  magenta: '#7a3e9d',
  cyan: '#0083b2',
  white: '#f5f5f5',
};

const terminalThemes: Record<string, ITheme> = {
  dark: darkTerminalTheme,
  light: lightTerminalTheme,
  'phpstorm-dark': phpstormDarkTerminalTheme,
  'solarized-light': solarizedLightTerminalTheme,
  'quiet-light': quietLightTerminalTheme,
};

export function getTerminalTheme(theme: string): ITheme {
  return terminalThemes[theme] ?? darkTerminalTheme;
}
