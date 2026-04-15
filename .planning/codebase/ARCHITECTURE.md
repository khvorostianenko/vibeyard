# Architecture

**Analysis Date:** 2026-04-14

## Pattern Overview

**Overall:** Three-process Electron architecture with strict process isolation and IPC-based communication.

**Key Characteristics:**
- Each process (main, preload, renderer) has isolated responsibilities and separate build targets
- Bidirectional IPC messaging between renderer and main process via namespaced APIs
- Provider abstraction system for multi-CLI support (Claude, Copilot, Gemini, Codex)
- Persistent state management in `~/.vibeyard/state.json` with debounced saves (300ms)
- Terminal rendering via xterm.js with WebGL acceleration and software fallback
- Reactive AppState singleton in renderer using event emitter pattern

## Layers

**Main Process (Node.js):**
- Purpose: Window lifecycle, PTY management, filesystem operations, persistent state
- Location: `src/main/`
- Contains: IPC handlers, PTY spawning, provider system, hooks, config watchers
- Depends on: Electron, node-pty, fs, child_process
- Used by: Renderer process via IPC; orchestrates all background operations

**Preload Bridge:**
- Purpose: Secure context isolation bridge exposing limited API to renderer
- Location: `src/preload/preload.ts`
- Contains: contextBridge definitions for `pty`, `session`, `store`, `fs`, `provider`, `menu`, `git`, `update`, `app`, `browser`, `mcp` namespaces
- Depends on: Electron contextBridge, ipcRenderer
- Used by: Renderer process (window.vibeyard)

**Renderer (Browser):**
- Purpose: DOM-based UI with terminal rendering and session management
- Location: `src/renderer/`
- Contains: AppState singleton, components, event listeners, UI logic
- Depends on: xterm.js, DOM APIs, Preload bridge (window.vibeyard)
- Used by: User interactions trigger IPC calls to main process

**Shared Types:**
- Purpose: Type definitions used across processes
- Location: `src/shared/types.ts`, `src/shared/constants.ts`, `src/shared/platform.ts`
- Contains: SessionRecord, ProjectRecord, ProviderId, CostInfo, ContextWindowInfo
- Depends on: TypeScript only
- Used by: Main, preload, renderer for type safety

**Provider System:**
- Purpose: Abstract CLI-specific behavior behind CliProvider interface
- Location: `src/main/providers/`
- Contains: ClaudeProvider, CodexProvider, CopilotProvider, GeminiProvider implementations
- Depends on: provider.ts interface, claude-cli.ts, config watchers, hooks
- Used by: ipc-handlers.ts, pty-manager.ts for session spawning

## Data Flow

**PTY Spawn Flow:**

1. User clicks "New Session" in renderer
2. Renderer invokes `window.vibeyard.pty.create(sessionId, cwd, ...)`
3. IPC handler in main process (`ipc-handlers.ts` → `pty:create`) routes to `spawnPty()`
4. `pty-manager.ts` calls provider-specific `buildArgs()` and `buildEnv()`
5. `node-pty` spawns CLI process with proper PATH from registry (Windows) or shell (macOS/Linux)
6. Main process attaches hook watchers and registers session with `hook-status.ts`
7. PTY data events flow back to renderer via `window.vibeyard.pty.onData()` callback
8. Renderer passes data to `terminal-pane.ts` which feeds xterm.js terminal

**Cost/Context Data Flow:**

1. CLI emits `statusLine` with cost/context JSON
2. Main process extracts via IPC send: `session:costData`
3. Renderer listens with `window.vibeyard.session.onCostData()` callback
4. Triggers `session-cost.ts` to update in-memory tracking and persisted state
5. `terminal-pane.ts` updates cost display in DOM

**State Persistence Flow:**

1. AppState mutation in renderer triggers event emit (e.g., `project-added`)
2. Component listens and calls `appState.updateSession*()` or `appState.removeSession()`
3. State change calls `persist()` which invokes `window.vibeyard.store.save()`
4. Main process debounces (300ms) and writes atomically to `~/.vibeyard/state.json`
5. On app quit, `flushState()` ensures final write completes synchronously

**State Management:**
- AppState holds all runtime state: projects, sessions, layout, preferences
- Navigation history (session switching) tracked separately with undo/redo support
- Session-level state (cost, context, activity status) stored in module-level Maps in renderer
- Persisted to filesystem on mutations, restored on app load

## Key Abstractions

**SessionRecord:**
- Purpose: Represents a single CLI session (terminal, inspector, file viewer, etc.)
- Examples: `src/shared/types.ts` line 72
- Pattern: Polymorphic via `type` field; contains provider-specific metadata

**ProjectRecord:**
- Purpose: Container for sessions, layout, and project-level settings
- Examples: `src/shared/types.ts` line 127
- Pattern: Owns sessions array; tracks active session and layout (tabs/split modes)

**CliProvider:**
- Purpose: Abstract interface for CLI-specific behavior
- Examples: `src/main/providers/claude-provider.ts`, `src/main/providers/codex-provider.ts`
- Pattern: Each provider implements binary resolution, env vars, hooks, config reading

**Terminal Instance:**
- Purpose: Wraps xterm.js terminal and PTY state per session
- Examples: `src/renderer/components/terminal-pane.ts` line 16
- Pattern: Singleton per sessionId; tracks terminal, fitAddon, searchAddon, session metadata

## Entry Points

**Application Entry:**
- Location: `src/main/main.ts`
- Triggers: App startup (whenReady)
- Responsibilities: Window creation, provider initialization, prerequisites validation, hook installation, auto-updater setup

**Renderer Initialization:**
- Location: `src/renderer/index.ts`
- Triggers: Preload bridge ready
- Responsibilities: Wire PTY/IPC event handlers, initialize components (sidebar, tab-bar, terminal panes), load persisted state, show modals on empty state

**Preload Bridge:**
- Location: `src/preload/preload.ts`
- Triggers: BrowserWindow created with preload script
- Responsibilities: Expose window.vibeyard API, connect ipcRenderer to contextBridge namespaces

## Error Handling

**Strategy:** Multi-layer error catching with fallback behaviors

**Patterns:**
- IPC handlers wrap try-catch and return error results to renderer
- PTY errors logged to console; failed spawn shows error modal
- Missing prerequisites detected in `validatePrerequisites()` and user warned
- Config watcher errors logged but don't crash app
- Unhandled promise rejections in renderer logged to debug panel
- File read errors fall back to cached values or empty defaults

## Cross-Cutting Concerns

**Logging:**
- Main process logs to console (captured in Electron logs)
- Renderer has optional debug panel that captures IPC events and state mutations
- Enabled by `preferences.debugMode` in settings

**Validation:**
- Providers validate prerequisites (binary exists, dependencies installed)
- Settings validation via provider `validateSettings()` (checks config files)
- File paths validated against allowed read/write zones in `ipc-handlers.ts`
- Project paths must exist and be readable directories

**Authentication:**
- Claude CLI handles auth internally (API key in environment)
- Main process manages provider env vars including API keys from config files
- No auth stored in Vibeyard state; delegates to CLI providers

**Platform Handling:**
- Platform detection centralized in `src/main/platform.ts` and `src/renderer/platform.ts`
- Imports: `isWin`, `isMac`, `isLinux`, `pathSep`, `whichCmd`, `pythonBin`
- Never inline platform checks; always import from platform.ts
- Exception: `claude-cli.ts` has intentional managed-path branches

---

*Architecture analysis: 2026-04-14*
