# External Integrations

**Analysis Date:** 2026-04-14

## APIs & External Services

**Model Context Protocol (MCP):**
- MCP Server connections (SSE and HTTP streaming transports)
  - SDK: `@modelcontextprotocol/sdk` v1.27.1
  - Location: `src/main/mcp-client.ts` — Manages MCP client lifecycle, lists tools/resources/prompts
  - IPC handlers: `src/main/mcp-ipc-handlers.ts` — Exposes MCP operations to renderer
  - HTTP-only: Supports both SSE (Server-Sent Events) and StreamableHTTP transports for MCP servers
  - Usage: Tool and resource discovery via MCP endpoints configured in UI

**Git Integration:**
- Git status and repository metadata via `git` CLI
  - Location: `src/main/git-watcher.ts` — Watches working tree, refs, and HEAD for changes
  - Location: `src/main/git-status.ts` — Resolves git remote URLs (SSH to HTTPS normalization)
  - Detection: Git directory resolution via `git rev-parse --git-dir`
  - Usage: Triggers session re-sync on file/commit/branch changes; resolves GitHub URLs from remotes

**GitHub:**
- GitHub releases (auto-update source)
  - Publisher: `electron-updater` v6.8.3
  - Configuration: `package.json` → `publish.provider: "github"` with owner `elirantutia`, repo `vibeyard`
  - Usage: Automatic update checking every 4 hours, downloads and installs on app quit

## Data Storage

**Databases:**
- Not used — No database integration

**File Storage:**
- Local filesystem only
  - Primary: `~/.vibeyard/state.json` — App state persistence (projects, sessions, preferences)
  - Atomic writes via temp file + rename to prevent corruption
  - Auto-migration of legacy `claudeSessionId` to `cliSessionId` on load
  - Debounced saves (300ms) to disk, flushed on quit
  - Location: `src/main/store.ts` — State load/save logic

**Caching:**
- In-memory caching:
  - PATH environment variable cached on first access (`cachedFullPath` in `src/main/pty-manager.ts`)
  - Session cost/activity state in renderer memory (debounced persistence to `~/.vibeyard/state.json`)
  - CLI provider binary paths cached per provider instance

## Authentication & Identity

**Auth Provider:**
- Custom per CLI provider (no centralized auth service)
  - Claude Code: Uses existing Claude CLI authentication (separate from Vibeyard)
  - GitHub Copilot: Uses GitHub Copilot CLI authentication
  - Gemini CLI: Uses Gemini CLI authentication
  - Each provider manages its own credentials via CLI tool configuration

**Session Management:**
- Session tracking via CLI provider tokens (`cliSessionId`):
  - Stored in `~/.vibeyard/state.json` under `SessionRecord.cliSessionId`
  - Used for session resumption via provider-specific args (e.g., `claude -r <sessionId>`)
  - Each session can be associated with different CLI providers via `SessionRecord.providerId`

**Environment Variables:**
- Provider-specific session IDs passed via environment variables:
  - `CLAUDE_IDE_SESSION_ID` — Claude Code session identifier
  - Provider-specific vars (Copilot, Gemini) — See `src/main/providers/copilot-provider.ts`, `gemini-provider.ts`
  - All providers have access to modified PATH via `getFullPath()` in `src/main/pty-manager.ts`

## Monitoring & Observability

**Error Tracking:**
- Not detected — No error tracking service integrated

**Logs:**
- Console logging (stderr/stdout from PTY streams rendered in terminal)
- Debug output via console in main/renderer processes
- Debug mode toggle in preferences (`debugMode` in `~/.vibeyard/state.json`)
- Hook status and warnings logged to console on app startup

**Cost Tracking:**
- Per-session cost parsing from Claude Code status line output
  - Location: `src/renderer/session-cost.ts` — Parses cost, tokens, cache, duration from CLI output
  - Status line format: Reads from Claude Code `statusLine` setting, falls back to regex patterns
  - Aggregate cost calculation available for reporting
  - Cost displayed in session status bar (USD, tokens, cache info)

**Activity Tracking:**
- Session state machine (working/waiting/idle)
  - Location: `src/renderer/session-activity.ts` — Debounced activity detection
  - Context window tracking: `src/renderer/session-context.ts` — Token usage per session
  - Insights: `src/renderer/session-insights.ts` — Session metrics and statistics

## CI/CD & Deployment

**Hosting:**
- GitHub releases (distribution and auto-update source)
  - Release artifacts: `.dmg`/`.zip` (macOS), `.deb`/`.AppImage` (Linux), NSIS installer + portable `.exe` (Windows)
  - Notarization: Enabled for macOS releases

**CI Pipeline:**
- GitHub Actions (inferred from `package.json` → `publish.provider: "github"`)
- Cross-platform builds: macOS, Linux, Windows (via electron-builder)
- No explicit CI config in repo root (likely in `.github/workflows/`)

**Auto-Updates:**
- electron-updater v6.8.3
  - Check interval: 4 hours after 10-second startup delay
  - Auto-download enabled, auto-install on quit
  - Fallback: Manual update check available via UI

## Webhooks & Callbacks

**Incoming:**
- MCP server connections (HTTP/SSE)
  - Endpoints: User-configured MCP server URLs (HTTP/HTTPS only, validated in `src/main/ipc-handlers.ts`)
  - Usage: Tool/resource discovery and invocation

**Outgoing:**
- Not detected — No outgoing webhooks to external services

## Environment Configuration

**No required env vars** — App uses local filesystem and CLI provider authentication.

**Optional configuration:**
- `NVM_DIR` — Node Version Manager directory (read if present, defaults to `~/.nvm`)
- `SHELL` — User shell for PATH sourcing (macOS/Linux, defaults to `/bin/zsh`)
- `COMSPEC` — Windows command shell (defaults to `cmd.exe`)
- `PATH` — System PATH (read from Windows registry on Windows for up-to-date paths)
- `ProgramData` — Windows program data directory (for Chocolatey resolution)

**Provider-specific env vars:**
- `CLAUDE_IDE_SESSION_ID` — Set by Vibeyard for Claude Code
- `CLAUDE_CODE` — Checked for conflicts, deleted to avoid subprocess detection issues
- Copilot/Gemini-specific vars — See respective provider implementations

## Secrets location

- No secrets stored in Vibeyard codebase
- CLI provider credentials managed entirely by respective CLI tools (Claude CLI, Copilot CLI, Gemini CLI)
- State file (`~/.vibeyard/state.json`) contains no sensitive data (only session metadata, preferences)

## External CLI Tools (Abstraction Layer)

**Provider Registry:**
- Location: `src/main/providers/registry.ts`
- Interface: `CliProvider` in `src/main/providers/provider.ts`
- Available providers:
  - `ClaudeProvider` (`src/main/providers/claude-provider.ts`) — Claude Code integration
  - `CopilotProvider` (`src/main/providers/copilot-provider.ts`) — GitHub Copilot integration
  - `GeminiProvider` (`src/main/providers/gemini-provider.ts`) — Google Gemini CLI integration
  - `CodexProvider` (`src/main/providers/codex-provider.ts`) — Placeholder/test provider

**Provider Capabilities:**
- Session resume
- Cost tracking (Claude Code only)
- Context window display (Claude Code only)
- Hook status reporting (Claude Code, Copilot, Gemini)
- Config file reading (all)
- Shift+Enter newline handling (Claude Code only)
- Plan mode arguments (provider-specific)

**Binary Resolution:**
- Cross-platform binary lookup: `src/main/providers/resolve-binary.ts`
- Windows: Checks npm global, Chocolatey, PATH
- macOS/Linux: PATH lookup
- Validation: `validateBinaryExists()` checks for executable existence

**Session Resumption:**
- Location: `src/main/providers/resume-handoff.ts`
- Mechanism: Stores `cliSessionId` in session record, resumes via provider-specific args
- Transcript retrieval: Optional provider method `getTranscriptPath()` for prior session transcripts

---

*Integration audit: 2026-04-14*
