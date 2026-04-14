import { appState } from './state.js';
import { getAllInstances } from './components/terminal-pane.js';
import { getAllShellInstances } from './components/project-terminal.js';
import { getAllRemoteInstances } from './components/remote-terminal-pane.js';
import type { ThemeMode } from '../shared/types.js';
import type { ITheme } from '@xterm/xterm';

const terminalThemes: Record<string, ITheme> = {
  dark: {
    background: '#000000',
    foreground: '#e0e0e0',
    cursor: '#e94560',
    selectionBackground: '#ff6b85a6',
    black: '#000000',
    red: '#e94560',
    green: '#0f9b58',
    yellow: '#f4b400',
    blue: '#4285f4',
    magenta: '#ab47bc',
    cyan: '#00acc1',
    white: '#e0e0e0',
  },
  light: {
    background: '#ffffff',
    foreground: '#1a1a1a',
    cursor: '#d63050',
    selectionBackground: '#ff6b8540',
    black: '#1a1a1a',
    red: '#d63050',
    green: '#0a7b45',
    yellow: '#b58900',
    blue: '#2563eb',
    magenta: '#8b3dab',
    cyan: '#0891b2',
    white: '#f5f5f5',
  },
  'phpstorm-dark': {
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
  },
  'solarized-light': {
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
  },
  'quiet-light': {
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
  },
};

const THEME_ORDER: ThemeMode[] = ['dark', 'light', 'phpstorm-dark', 'solarized-light', 'quiet-light', 'system'];

let systemDarkQuery: MediaQueryList | null = null;

/** Resolve the preference to a concrete theme name (CSS data-theme value). */
function resolveTheme(): string {
  const mode = appState.preferences?.theme ?? 'dark';
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

/** Get the xterm.js theme object for the current resolved theme. */
export function getTerminalTheme(): ITheme {
  return terminalThemes[resolveTheme()] ?? terminalThemes['dark'];
}

/** Apply theme to all CSS variables and existing terminal instances. */
function applyTheme(): void {
  const resolved = resolveTheme();
  document.documentElement.setAttribute('data-theme', resolved);

  const theme = terminalThemes[resolved] ?? terminalThemes['dark'];

  for (const inst of getAllInstances().values()) {
    inst.terminal.options.theme = theme;
  }
  for (const inst of getAllShellInstances()) {
    inst.terminal.options.theme = theme;
  }
  for (const inst of getAllRemoteInstances().values()) {
    inst.terminal.options.theme = theme;
  }
}

/** Cycle through all themes in order. */
export function cycleTheme(): void {
  const current = appState.preferences?.theme ?? 'dark';
  const idx = THEME_ORDER.indexOf(current);
  const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
  appState.setPreference('theme', next);
}

/** Initialize theme system — call once at startup. */
export function initTheme(): void {
  applyTheme();

  appState.on('preferences-changed', () => applyTheme());

  systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemDarkQuery.addEventListener('change', () => {
    if ((appState.preferences?.theme ?? 'dark') === 'system') {
      applyTheme();
    }
  });
}
