# Concerns & Technical Debt

## Large Monolithic Files

Several files exceed 500+ lines and handle too many responsibilities:
- `src/renderer/state.ts` (~956 lines) — AppState singleton with all state management
- `src/renderer/components/tab-bar.ts` (~870 lines) — tab UI, drag/drop, context menus
- `src/renderer/components/preferences-modal.ts` (~730 lines) — all preference sections in one file
- `src/main/pty-manager.ts` — PTY lifecycle, spawn, cleanup, resize
- `src/renderer/components/terminal-pane.ts` — terminal creation, WebGL, fit, overlays

## innerHTML Usage

Widespread `innerHTML` assignments across renderer components. While inputs are generally internal (not user-supplied), this pattern is fragile:
- `src/renderer/components/sidebar.ts`
- `src/renderer/components/tab-bar.ts`
- `src/renderer/components/session-history.ts`
- Multiple modal/dialog components

**Risk:** XSS if any external data flows into these paths.

## Event Listener Cleanup

Several components add event listeners without guaranteed cleanup:
- `ResizeObserver` instances in terminal panes
- `document.addEventListener` in modals/dialogs (some cleaned up via `_cleanup`, some not)
- `appState.on()` subscriptions — no `off()` mechanism exists on AppState

**Risk:** Memory leaks over long app sessions.

## Unhandled Promise Chains

Some async operations lack proper error handling:
- Provider availability checks
- IPC calls that could fail silently
- File system operations in renderer (via preload bridge)

## PTY Process Cleanup

`pty-manager.ts` spawns child processes. If the app crashes or force-quits:
- PTY processes may become orphaned
- No PID tracking or cleanup-on-next-start mechanism
- `flushOnQuit` in store handles state saves but not PTY cleanup

## State Persistence Timing

- State saves are debounced (300ms) — crash within window loses data
- `flushOnQuit` mitigates for normal quit, but force-kill scenarios lose recent changes
- No write-ahead log or crash recovery

## Type Safety Gaps

- `(overlay as any)._cleanup` pattern in modals — attaching ad-hoc properties to DOM elements
- Some IPC handlers use loose typing
- `PersistedState` loaded from JSON with minimal validation (`version === 1` check only)

## No E2E Tests

- All tests are unit-level with mocked dependencies
- No Electron integration tests (Spectron/Playwright)
- No visual regression testing for UI themes
- Browser tab (webview) functionality untested

## Platform-Specific Code

- Platform detection centralized in `src/main/platform.ts` (good)
- But `claude-cli.ts` has an intentional exception with inline platform branching
- Windows path handling may have edge cases with spaces/unicode

## Build & Dev Experience

- No hot reload — every change requires `npm run build` + app restart
- No lint tooling configured (no ESLint, no Prettier)
- Manual asset copying via `scripts/copy-assets.js`

## Security Considerations

- `contextIsolation: true` and `nodeIntegration: false` — properly configured
- Preload bridge (`window.vibeyard`) properly scoped via `contextBridge`
- WebView/BrowserView usage in browser tabs — ensure `webSecurity` not disabled
- No CSP headers observed in HTML
