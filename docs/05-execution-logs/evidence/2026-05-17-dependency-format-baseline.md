# Dependency And Format Baseline Evidence

## Task

`phase-1-dependency-format-baseline`

## Summary

Handled two foundation maintenance issues before continuing `phase-1-api-contract-baseline`:

- Introduced the minimum database dependency baseline selected by ADR-001.
- Established a clean repository-wide Prettier baseline.
- Added `rawfiles` to `.prettierignore` so local original materials are not scanned by formatting.

## Dependency Changes

Runtime dependencies added:

- `drizzle-orm` `^0.45.2`
- `postgres` `^3.4.9`

Development dependency added:

- `drizzle-kit` `^0.31.10`

Human approval evidence:

```text
human approval from user message on 2026-05-17:
“如果合适的话，可以先处理这两个问题，并更新相关文档？”
```

## Commands

### Add Runtime Dependencies

Command:

```powershell
corepack pnpm@10 add drizzle-orm postgres
```

Output summary:

```text
dependencies:
+ drizzle-orm 0.45.2
+ postgres 3.4.9
Done in 38.1s using pnpm v10.33.4
```

### Add Migration Tooling

Command:

```powershell
corepack pnpm@10 add -D drizzle-kit
```

Output summary:

```text
devDependencies:
+ drizzle-kit 0.31.10
Ignored build scripts: esbuild@0.18.20, esbuild@0.25.12, esbuild@0.28.0.
Done in 37s using pnpm v10.33.4
```

The ignored build scripts warning is pnpm safety behavior. No approval-builds change was made in this task.

### Format Baseline

Command:

```powershell
npm.cmd run format
```

Output summary:

```text
> prettier --write .
Repository files were formatted successfully.
```

### Format Check

Command:

```powershell
npm.cmd run format:check
```

Output:

```text
Checking formatting...
All matched files use Prettier code style!
```

### Agent System Readiness

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Output summary:

```text
Required files and npm scripts were found.
Superpowers plugin and skill paths were found.
Local skill paths were found.
RESERVED skill path not installed: autopilot
```

### Full Quality Gate

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Output summary:

```text
RUN npm script: lint
> eslint

RUN npm script: typecheck
> tsc --noEmit

RUN npm script: test
> npm run test:unit && npm run test:e2e

Test Files  4 passed (4)
Tests       6 passed (6)

Running 1 test using 1 worker
ok 1 [chromium] e2e\home.spec.ts: loads the root navigation page
1 passed
```

## Residual Risk

- The format baseline intentionally touches many existing files. The change is mechanical Prettier output, not a semantic documentation or source rewrite.
- `pnpm add -D drizzle-kit` reported ignored esbuild build scripts. This does not block current lint/typecheck/test gates, but future migration CLI workflows should revisit `pnpm approve-builds` only if the CLI requires approved build artifacts.
- No Better Auth, AI SDK, Markdown, RAG, storage, or cloud SDK dependencies were introduced. Those should land only with their active queue tasks.
