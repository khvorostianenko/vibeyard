import { appState } from './state.js';
import { applyThemeToAllTerminals } from './components/terminal-pane.js';
import { applyThemeToAllShells } from './components/project-terminal.js';
import { applyThemeToAllRemoteTerminals } from './components/remote-terminal-pane.js';
import type { ThemeMode } from '../shared/types.js';

const THEME_ORDER: ThemeMode[] = ['dark', 'light', 'phpstorm-dark', 'solarized-light', 'quiet-light', 'system'];

let systemDarkQuery: MediaQueryList | null = null;

/** Resolve a theme preference to a concrete theme name (CSS data-theme value). */
export function resolveTheme(mode?: ThemeMode): string {
  const theme = mode ?? appState.preferences?.theme ?? 'dark';
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

/** Apply theme to CSS variables and all existing terminal instances. */
function applyTheme(): void {
  const resolved = resolveTheme();
  document.documentElement.dataset.theme = resolved;
  applyThemeToAllTerminals(resolved);
  applyThemeToAllShells(resolved);
  applyThemeToAllRemoteTerminals(resolved);
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
  appState.on('state-loaded', () => applyTheme());

  systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemDarkQuery.addEventListener('change', () => {
    if ((appState.preferences?.theme ?? 'dark') === 'system') {
      applyTheme();
    }
  });
}
