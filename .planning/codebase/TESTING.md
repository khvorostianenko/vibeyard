# Testing

## Framework & Configuration

- **Framework:** Vitest v4.1.0 with v8 coverage
- **Config:** `vitest.config.ts` at project root
- **Coverage:** Terminal + HTML report at `coverage/index.html`

## Test File Organization

Tests are **co-located** with source files as `*.test.ts`:
- `src/main/store.test.ts`
- `src/main/pty-manager.test.ts`
- `src/renderer/components/project-terminal.test.ts`
- `src/renderer/session-cost.test.ts`
- `src/renderer/session-activity.test.ts`
- `src/renderer/session-context.test.ts`

## Running Tests

```bash
npm test             # Run all tests once
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## Mocking Patterns

### Main Process Tests
Heavy use of `vi.mock()` for Node.js modules:
- `fs` — filesystem operations
- `child_process` — spawning CLI tools
- `node-pty` — terminal emulation
- `os` — platform detection

### Renderer Tests
- Three modules expose `_resetForTesting()` to clear module-level state:
  - `session-cost.ts`
  - `session-activity.ts`
  - `session-context.ts`
- DOM mocking via `document.createElement` stubs
- `appState` mocked or reset between tests

### Platform Mocking
Platform detection centralized in `src/main/platform.ts`. Tests mock `isWin`/`isMac`/`isLinux` from there — never inline `process.platform`.

## Test Exclusion from Builds

Test files excluded from production via `exclude` in:
- `tsconfig.main.json`
- `tsconfig.renderer.json`

## Current Coverage

- **75 test files**, **1127 tests** all passing
- Main process: store, PTY manager, CLI resolution, provider system
- Renderer: cost parsing, activity tracking, context tracking, clipboard, terminal utils
- Shared: type validation

## Patterns

- Tests use `describe`/`it` blocks with clear naming
- `beforeEach` for setup, cleanup via `_resetForTesting()` or fresh mocks
- Assertions via `expect()` with standard matchers
- No E2E/integration tests — all unit-level
