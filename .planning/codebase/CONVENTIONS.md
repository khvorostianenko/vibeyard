# Coding Conventions

**Analysis Date:** 2026-04-14

## Naming Patterns

**Files:**
- PascalCase for classes and exportable classes: `ClaudeProvider`, `ShortcutManager`
- camelCase for utility functions and modules: `pty-manager.ts`, `session-cost.ts`
- kebab-case for filenames with hyphens: `session-title.ts`, `tool-catalog.ts`
- `.test.ts` suffix for test files (co-located with source)

**Functions:**
- camelCase for all functions: `setContextData()`, `getContext()`, `parseTitle()`
- Prefix with underscore for internal test-only exports: `_resetForTesting()`
- Private methods use `private` keyword, no underscore prefix

**Variables:**
- camelCase for all variables and constants
- UPPER_SNAKE_CASE for constants that are truly constant: `NAV_HISTORY_MAX`, `PATH_MARKER_BEGIN`
- Numeric literals with underscores for readability: `200_000` (context window tokens), `80_000` (input tokens)

**Types:**
- PascalCase for type/interface names: `SessionRecord`, `CliProviderCapabilities`, `PersistedState`
- Suffix with `Info`, `Data`, or `Result` for data objects: `CostInfo`, `ContextWindowInfo`, `ReadinessResult`
- Use `type` keyword for unions/aliases, `interface` for object contracts

**Module-level state:**
- Module-scoped `const` or `let` for singleton maps: `const ptys = new Map<string, PtyInstance>()`
- Exported accessor functions to read/write state: `getContext()`, `setContextData()`
- Hidden implementation details, expose contracts via functions

## Code Style

**Formatting:**
- No explicit linter configured (per CLAUDE.md)
- TypeScript strict mode enabled in `tsconfig.json`
- Import formatting: group external modules, then relative imports
- Line length: practical limits observed (~100-120 characters)

**Linting:**
- No ESLint or Prettier configured
- Rely on TypeScript strict mode for type safety
- Manual code review for style consistency

## Import Organization

**Order:**
1. External modules (Node.js built-ins, npm packages): `import * as fs from 'fs'`, `import * as pty from 'node-pty'`
2. Type-only imports: `import type { SessionRecord } from '...'`
3. Relative imports from same module: `import { helper } from './helper.js'`
4. Relative imports from parent/sibling directories: `import { getProvider } from '../providers/registry'`

**Path Aliases:**
- Relative paths use `.js` extension in imports (ESM convention)
- No path aliases configured; use relative paths like `'./state.js'` and `'../shared/types.js'`
- Three-process architecture uses full paths: `src/main/`, `src/renderer/`, `src/preload/`, `src/shared/`

## Error Handling

**Patterns:**
- Errors are caught and logged with context, not silently swallowed
- Error logging includes the function name and sessionId (sanitized): `console.warn(`[pty-manager] writePty(${formatSessionIdForLog(sessionId)}) failed: ${message}`)`
- Empty catch blocks used only when failure is expected and benign (e.g., parsing registry on non-Windows): `catch {}`
- For critical operations that may fail, include try-catch with descriptive warning

**Session-specific error handling:**
- Operations on unknown sessions are silent no-ops: `if (!state || state.status === status) return;`
- Check for existence before operating: `const session = project.sessions.find(...); if (!session) return;`
- Dead PTY handles (Windows node-pty issue) are dropped only when error message indicates exit: `if (isDeadPtyError(message)) ptys.delete(sessionId);`

## Logging

**Framework:** `console` object directly (no logging library)

**Patterns:**
- `console.warn()` for recoverable errors and alerts
- Include component context: `[pty-manager]` prefix in pty-manager.ts
- Sanitize user input (e.g., sessionId) with control character escaping when logging untrusted data
- Log errors with context: "Failed to resolve PATH from login shell" includes the reason

**Sensitive data:**
- Never log API keys, secrets, or credentials
- Log sessionId in a sanitized form to prevent log injection attacks
- Use `JSON.stringify()` on hostile input to escape control characters

## Comments

**When to Comment:**
- Complex algorithms or non-obvious logic: explaining why a check is needed (e.g., "Don't let Stop/StopFailure ('waiting') overwrite a just-set 'completed' status")
- Platform-specific or cross-platform workarounds: "On Windows, packaged Electron apps inherit PATH from explorer.exe which may be stale"
- Regression guards referencing issue numbers: `// Regression test for #70: node-pty on Windows throws synchronously`
- Explain intent, not what the code does: "We must install the hook file before spawning the binary" (why), not "Install hooks before spawn" (what)

**JSDoc/TSDoc:**
- Used selectively for public API functions
- Format: `/** Description of function purpose and behavior. */`
- Single line for simple functions: `/** Create a mock KeyboardEvent-like object for testing in Node environment. */`
- Document parameters only if non-obvious
- Example from codebase: `/** Centralized platform detection and derived constants for the main process. */` in `platform.ts`

## Function Design

**Size:** Functions range from 5-50 lines; longer functions are refactored into smaller pieces

**Parameters:**
- Use object parameter destructuring for multiple related parameters: `buildEnv(sessionId: string, baseEnv: Record<string, string>)`
- Pass options objects for optional flags: `{ cwd, isResume, extraArgs, initialPrompt }`

**Return Values:**
- Functions return early to avoid nesting: `if (!sessionId || this.navSuppressPush) return;`
- Null/undefined for optional values: `getContext('unknown')` returns `null`
- Empty Map/Set when no data: `getAggregateCost()` returns zeroed object even when empty
- Unsubscribe functions return a cleanup function: `onChange(callback)` returns `() => { ... }`

## Module Design

**Exports:**
- Named exports for utility functions: `export function parseTitle(...)`
- Default exports avoided; use named exports
- Barrel files for convenience re-exports (e.g., `browser-tab-pane.ts` re-exports from `pane.ts`)

**Barrel Files:**
- `browser-tab-pane.ts` acts as backward-compatibility shim for `browser-tab/pane.ts`
- Single-file modules do not use barrel pattern

**Module-level State Management:**
- Encapsulate state in module scope: `const sessions = new Map<string, SessionState>()`
- Export accessor functions only: `getStatus()`, `setStatus()`, `onChange()`
- Listeners managed via exported `onChange()` returning unsubscribe function
- Test-only reset via `_resetForTesting()` for co-located tests

## Type Safety

**Strict TypeScript:**
- `strict: true` in tsconfig.json enforces null checks, undefined checks
- Use `type` keyword for type-only imports: `import type { SessionRecord }`
- Interface/type usage: `interface PtyInstance { ... }`, `type EventType = 'project-added' | ...`
- Avoid `any`; use unions or generics when needed

## Async/await

**Pattern:**
- Async functions return `Promise<T>`
- Await calls in try-catch blocks for error handling
- Silent catch blocks acceptable when failure is expected (e.g., registry read on non-Windows)
- Example: `await provider.installHooks(null, cwd)` wrapped in try-catch with warning on failure

---

*Convention analysis: 2026-04-14*
