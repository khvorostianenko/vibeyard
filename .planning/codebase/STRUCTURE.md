# Codebase Structure

**Analysis Date:** 2026-04-14

## Directory Layout

```
vibeyard/
├── src/
│   ├── main/                    # Electron main process (Node.js)
│   │   ├── providers/           # CLI provider implementations
│   │   ├── readiness/           # Project readiness checkers
│   │   ├── main.ts              # App entry point
│   │   ├── ipc-handlers.ts       # IPC message handlers
│   │   ├── pty-manager.ts        # PTY spawning and management
│   │   ├── store.ts              # Persistent state I/O
│   │   ├── hook-status.ts        # CLI hook status tracking
│   │   └── [provider-specific].ts # Claude/Copilot/Gemini configs
│   ├── preload/                 # Electron preload script (context bridge)
│   │   └── preload.ts            # Expose window.vibeyard API
│   ├── renderer/                # Browser renderer process
│   │   ├── components/          # UI components (60+ files)
│   │   │   ├── terminal-pane.ts      # xterm.js wrapper
│   │   │   ├── sidebar.ts            # Project/session list sidebar
│   │   │   ├── split-layout.ts       # Tabs/split mode manager
│   │   │   ├── browser-tab/          # Browser tab subpane
│   │   │   └── [other-dialogs].ts    # Modals, inspectors, panels
│   │   ├── styles/              # CSS stylesheets
│   │   ├── tools/               # Tool detection and analysis
│   │   ├── sharing/             # WebRTC P2P session sharing
│   │   ├── insights/            # Session insights and analytics
│   │   ├── index.ts              # Renderer entry point
│   │   ├── state.ts              # AppState singleton
│   │   ├── session-cost.ts       # Cost tracking per session
│   │   ├── session-context.ts    # Context window tracking
│   │   ├── session-activity.ts   # Working/waiting/idle state
│   │   └── [utilities].ts        # Theme, keybindings, notifications
│   └── shared/                  # Shared types and utilities
│       ├── types.ts              # SessionRecord, ProjectRecord, etc.
│       ├── constants.ts          # App constants
│       └── platform.ts           # Cross-process platform detection
├── dist/                        # Build output (not committed)
│   ├── main/
│   ├── preload/
│   └── renderer/
├── build/                       # App icons, entitlements
├── assets/                      # Renderer static assets
├── tsconfig*.json               # Per-process TypeScript configs
├── package.json                 # Dependencies and build scripts
└── CLAUDE.md                    # Architecture guidance
```

## Directory Purposes

**`src/main/`:**
- Purpose: Electron main process code (runs on desktop)
- Contains: Window lifecycle, PTY management, IPC handlers, filesystem access
- Key files: `main.ts` (startup), `ipc-handlers.ts` (message routing), `pty-manager.ts` (terminal spawning)

**`src/main/providers/`:**
- Purpose: CLI provider abstraction for Claude, Copilot, Gemini, Codex
- Contains: Provider interfaces, implementations, binary resolution, config reading
- Key files: `provider.ts` (interface), `registry.ts` (provider lookup), `claude-provider.ts` (main implementation)

**`src/main/readiness/`:**
- Purpose: Analyze project setup and recommend improvements
- Contains: Checkers for configs, instructions, custom extensions per provider
- Key files: `analyzer.ts` (orchestrator), `checkers/` (individual checks)

**`src/preload/`:**
- Purpose: Electron preload script (runs before renderer content loads)
- Contains: contextBridge setup exposing `window.vibeyard` API
- Key files: `preload.ts` (only file; ~100 lines)

**`src/renderer/`:**
- Purpose: Browser-based UI rendering
- Contains: DOM components, event listeners, AppState, terminal rendering
- Key files: `index.ts` (entry, wires events), `state.ts` (AppState singleton), `components/` (all UI)

**`src/renderer/components/`:**
- Purpose: Individual UI components and dialogs
- Contains: 60+ files organized by feature (terminal, sidebar, inspector, modals)
- Key files:
  - `terminal-pane.ts` (xterm.js + PTY rendering)
  - `sidebar.ts` (project/session list)
  - `split-layout.ts` (tabs/split management)
  - `mcp-inspector.ts` (MCP server browser)
  - `preferences-modal.ts` (settings dialog)

**`src/renderer/components/browser-tab/`:**
- Purpose: Browser tab session subpane (embedded webview)
- Contains: Navigation, viewport, inspect mode, flow recording, session integration
- Key files: `pane.ts` (DOM builder), `instance.ts` (registry), `navigation.ts` (URL bar)

**`src/renderer/styles/`:**
- Purpose: CSS stylesheets and theme definitions
- Contains: Global styles, component styles, dark/light themes
- Key files: Theme variables, layout grid, xterm customization

**`src/renderer/tools/`:**
- Purpose: Detect missing CLI tools and large files
- Contains: Tool catalog, missing tool detector, file size analyzer
- Key files: `tool-catalog.ts` (known tools), `missing-tool-detector.ts` (scanner)

**`src/renderer/sharing/`:**
- Purpose: WebRTC-based P2P session sharing
- Contains: Peer host/guest, crypto, WebRTC utilities
- Key files: `share-manager.ts` (orchestrator), `peer-host.ts`, `peer-guest.ts`

**`src/renderer/insights/`:**
- Purpose: Session analytics (context usage, cost trends)
- Contains: Insight types, registry, big initial context detector
- Key files: `registry.ts` (insight plugins), `big-initial-context.ts` (example)

**`src/shared/`:**
- Purpose: Definitions and types shared across main/preload/renderer
- Contains: Type definitions, constants, platform utilities
- Key files: `types.ts` (SessionRecord, ProjectRecord, etc.), `platform.ts` (isWin, isMac, etc.)

## Key File Locations

**Entry Points:**
- `src/main/main.ts`: App startup, window creation, provider init
- `src/renderer/index.ts`: Renderer initialization, event wiring, component setup
- `src/preload/preload.ts`: Preload bridge, API exposure

**Configuration:**
- `src/main/ipc-handlers.ts`: All IPC message handlers
- `src/main/store.ts`: Persistent state I/O (reads/writes `~/.vibeyard/state.json`)
- `src/renderer/state.ts`: AppState singleton with event emitter pattern

**Core Logic:**
- `src/main/pty-manager.ts`: PTY spawning, resizing, data flow
- `src/main/providers/registry.ts`: Provider lookup and initialization
- `src/renderer/components/terminal-pane.ts`: xterm.js rendering and PTY integration
- `src/renderer/components/split-layout.ts`: Layout management (tabs vs split)

**Testing:**
- `src/**/*.test.ts`: Co-located test files (excluded from production builds)
- Test config: `tsconfig.test.json`, `vitest.config.*` (if present)

## Naming Conventions

**Files:**
- Kebab-case: `terminal-pane.ts`, `split-layout.ts`
- Utilities: `terminal-utils.ts`, `dom-utils.ts`
- Test files: `*.test.ts` (co-located with source)
- Component exports: Lowercase function names (`createTerminalPane`, `initSidebar`)

**Directories:**
- Lowercase: `providers/`, `components/`, `tools/`, `sharing/`
- Plural for collections: `components/`, `providers/`, `checkers/`

**Exports:**
- Named exports preferred: `export function createTerminalPane() {}`
- Singleton instances: `export const appState = new AppState()`
- Re-export shims for backward compatibility: `browser-tab-pane.ts` re-exports `browser-tab/pane.ts`

## Where to Add New Code

**New Feature (CLI integration):**
- Primary code: `src/main/providers/[provider-name].ts`
- Config reading: `src/main/[provider-name]-config.ts`
- Hooks: `src/main/[provider-name]-hooks.ts`
- Tests: `src/main/[provider-name].test.ts`

**New Component/UI:**
- Implementation: `src/renderer/components/[component-name].ts`
- Styling: Add classes to `src/renderer/styles/*.css`, use CSS variables
- State integration: Connect via `appState.on('event', callback)` if reactive
- Tests: `src/renderer/components/[component-name].test.ts`

**New Session Type:**
- Add `type` to SessionRecord union in `src/shared/types.ts`
- Create pane factory: `src/renderer/components/[type]-pane.ts`
- Register in split-layout.ts: Add create/show/hide/destroy exports
- Add IPC handler if needed: `src/main/ipc-handlers.ts`

**Utilities (shared):**
- Shared helpers: `src/shared/[module].ts` (types-only or cross-process)
- Main process utilities: `src/main/[module].ts` (file ops, path resolution)
- Renderer utilities: `src/renderer/[module].ts` (DOM, terminal, state)
- Platform-specific: Always use `src/main/platform.ts` or `src/renderer/platform.ts`, never inline

## Special Directories

**`dist/`:**
- Purpose: Compiled output
- Generated: Yes (by tsc and esbuild)
- Committed: No (.gitignore)
- Structure mirrors src/ organization (main/, preload/, renderer/)

**`build/`:**
- Purpose: App icons, macOS entitlements, Windows installer config
- Generated: No (hand-maintained)
- Committed: Yes
- Files: `icon.png`, `icon.icns`, `entitlements.mac.plist`

**`assets/`:**
- Purpose: Static files copied to dist/renderer (accessible from renderer)
- Generated: No (hand-maintained)
- Committed: Yes
- Includes: HTML, images, provider icons

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents
- Generated: Yes (by GSD mapper)
- Committed: Yes
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md

## Module-Level State Patterns

Three renderer modules expose `_resetForTesting()` to clear state between tests:

- `src/renderer/session-cost.ts`: Per-session cost tracking Map
- `src/renderer/session-activity.ts`: Per-session activity status Map
- `src/renderer/session-context.ts`: Per-session context window Map

These are used in test teardown to prevent cross-test state pollution.

## Build Targets

**Main Process:**
- Input: `src/main/**/*.ts`
- Config: `tsconfig.main.json`
- Compiler: `tsc` (TypeScript)
- Output: `dist/main/**/*.js` (CommonJS)
- Entry: `dist/main/main/main.js`

**Preload:**
- Input: `src/preload/preload.ts`
- Config: `tsconfig.preload.json`
- Compiler: `tsc`
- Output: `dist/preload/preload/preload.js` (CommonJS)

**Renderer:**
- Input: `src/renderer/index.ts` (bundles all renderer deps)
- Config: N/A (esbuild)
- Bundler: `esbuild`
- Output: `dist/renderer/index.js` (IIFE format, browser platform)
- Sourcemap: `dist/renderer/index.js.map`

All test files (*.test.ts) excluded from production builds via tsconfig `exclude` patterns.

---

*Structure analysis: 2026-04-14*
