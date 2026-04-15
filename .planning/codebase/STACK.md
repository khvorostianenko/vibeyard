# Technology Stack

**Analysis Date:** 2026-04-14

## Languages

**Primary:**
- TypeScript 5.7.0 - All source code (main, preload, renderer, shared)

**Secondary:**
- JavaScript - Build scripts and configuration

## Runtime

**Environment:**
- Node.js v24 (pinned in `.nvmrc`)
- Electron 41.0.0 - Desktop application framework

**Package Manager:**
- npm - Package management
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Electron 41.0.0 - Desktop app framework (multi-process architecture)
- xterm.js 6.0.0 - Terminal emulator/rendering
- @xterm/addon-fit 0.11.0 - Terminal fitting addon
- @xterm/addon-webgl 0.19.0 - WebGL rendering for terminal (with software fallback)
- @xterm/addon-search 0.16.0 - Terminal search functionality
- @xterm/addon-serialize 0.14.0 - Terminal state serialization
- @xterm/addon-web-links 0.12.0 - Clickable links in terminal output

**Testing:**
- Vitest 4.1.0 - Unit/integration test runner
- @vitest/coverage-v8 4.1.0 - Code coverage via v8

**Build/Dev:**
- esbuild 0.27.4 - Renderer bundler (IIFE format, browser platform)
- TypeScript compiler (tsc) - Main and preload compilation (CommonJS output)
- electron-builder 26.8.1 - App packaging and distribution

## Key Dependencies

**Critical:**
- @modelcontextprotocol/sdk 1.27.1 - MCP (Model Context Protocol) client for tool and resource discovery
- node-pty 1.1.0 - Pseudo-terminal creation and management for CLI sessions
- electron-updater 6.8.3 - Automatic app updates via GitHub releases

**Infrastructure:**
- dompurify 3.3.3 - HTML sanitization for browser tab rendering
- marked 17.0.5 - Markdown parsing for rendered output
- picomatch 4.0.3 - Glob pattern matching for file filtering

## Configuration

**Environment:**
- No `.env` files required - configuration via:
  - User preferences persisted to `~/.vibeyard/state.json`
  - CLI provider config files (`.claude-code.json`, `.copilot.json`, `.gemini.json`) in project roots
- Platform-specific shell PATH handling for macOS (login shell sourcing), Windows (registry reading), and Linux

**Build:**
- `tsconfig.json` - Root project references (composite mode)
- `tsconfig.main.json` - Main process compilation (ES2022, CommonJS output, outDir: `dist/main`)
- `tsconfig.preload.json` - Preload script compilation (CommonJS output, outDir: `dist/preload`)
- `tsconfig.renderer.json` - Renderer compilation (ES2022 modules, outDir: `dist/renderer`)
- `tsconfig.test.json` - Test-specific configuration
- `vitest.config.ts` - Test runner configuration (v8 coverage, HTML+LCOV reports)
- `package.json` build config:
  - Targets: `.dmg`/`.zip` (macOS), `.deb`/`.AppImage` (Linux), NSIS installer + portable `.exe` (Windows)
  - GitHub releases publisher
  - Entitlements for macOS (hardened runtime, notarization)

## Build Process

**Scripts:**
```bash
npm run build           # tsc (main + preload) + esbuild (renderer) + copy assets
npm run build:renderer # esbuild renderer only
npm run copy-assets    # Copy static assets via node scripts/copy-assets.js
npm start / npm run dev # Build then launch Electron
npm run pack           # Package without distribution
npm run dist           # Full build and distribution
npm test               # Run tests once
npm test:watch         # Watch mode
npm test:coverage      # Coverage report (HTML + LCOV)
```

**Output:**
- Main: `dist/main/main/main.js` (entry point referenced in package.json `main` field)
- Preload: `dist/preload/preload/preload.js` (loaded via BrowserWindow webPreferences)
- Renderer: `dist/renderer/index.js` (bundled IIFE, loaded in index.html)

## Platform Requirements

**Development:**
- Node.js v24 (required - see `.nvmrc`)
- Python (optional, required for hook installation on Windows, referenced in `src/main/prerequisites.ts`)
- Git (required for git status watching)

**Runtime (All Platforms):**
- At least one CLI provider installed:
  - Claude Code CLI (`claude` binary)
  - GitHub Copilot CLI (`copilot` binary)
  - Gemini CLI (`gemini` binary)
- Electron redistributable (bundled with packaged app)

**macOS:**
- Hardened runtime and entitlements enforcement
- Notarization enabled for release builds

**Windows:**
- NSIS installer and portable `.exe` support
- Registry reading for PATH environment variable
- Chocolatey binary resolution support

**Linux:**
- AppImage and `.deb` package support

## Architecture Notes

**Three-process Electron architecture:**
- **Main process** (`src/main/`) - Node.js, compiles to CommonJS (ES2022 target)
- **Preload** (`src/preload/preload.ts`) - Secure IPC bridge, compiles to CommonJS
- **Renderer** (`src/renderer/`) - Browser-side UI, compiles to ES2022 modules bundled as IIFE

**Compilation flow:**
1. Main + preload compiled separately via `tsc` (projects in composite mode)
2. Renderer bundled via esbuild with sourcemaps
3. Assets copied post-build
4. Electron-builder packages final dist/

**No hot reload** - Changes require rebuild + app restart.

---

*Stack analysis: 2026-04-14*
