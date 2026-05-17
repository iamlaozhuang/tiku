# Phase 2 Auth Dependency Repair Evidence

## Task

- Task id: `phase-2-auth-dependency-repair`
- Phase: `phase-2-user-auth`
- Branch: `codex/phase-2-auth-adapter-boundary`
- Evidence recorded at: `2026-05-17T21:43:09+08:00`

## Why This Repair Was Needed

`task-queue.yaml` marked `phase-2-auth-dependency-install` as `done`, but `package.json` did not contain the ADR-approved Better Auth dependencies needed by Phase 2 session/login work.

## Human Approval

Human approval was provided in chat on 2026-05-17:

> 如果有的话，批准执行

This approval applied to necessary dependency introduction or preparatory work for later Phase 2 tasks.

## Scope

Created:

- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-auth-dependency-repair.md`

Modified:

- `package.json`
- `pnpm-lock.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Not changed:

- `package-lock.json`
- `src/**`
- `drizzle/**`
- `.env.example`

## Dependency Changes

Added runtime dependencies:

- `better-auth` with specifier `^1.6.11`
- `@better-auth/drizzle-adapter` with specifier `^1.6.11`

## Command Evidence

Command:

```powershell
corepack pnpm@10 add better-auth @better-auth/drizzle-adapter
```

First result:

- Exit code: `124`
- Result: timed out after 180 seconds.
- Observed effect: `pnpm-lock.yaml` was partially updated while `package.json` did not yet include the dependencies.

Retry command:

```powershell
corepack pnpm@10 add better-auth @better-auth/drizzle-adapter
```

Retry result:

- Exit code: `0`
- Output included:
  - `dependencies:`
  - `+ @better-auth/drizzle-adapter ^1.6.11`
  - `+ better-auth ^1.6.11`
  - `Done in 7.3s using pnpm v10.33.4`

Dependency warning recorded:

- `better-call 1.3.5` reported unmet peer `zod@^4.0.0`, found `3.25.76`.
- Current validation gates still pass. Treat this as a dependency risk to revisit when Better Auth runtime APIs are imported.

## Required Validation

Command:

```powershell
npm.cmd run lint
```

Result:

- Exit code: `0`
- Output included: `eslint`

Command:

```powershell
npm.cmd run typecheck
```

Result:

- Exit code: `0`
- Output included: `tsc --noEmit`

Command:

```powershell
npm.cmd run test:unit
```

Result:

- Exit code: `0`
- Output included:
  - `Test Files 9 passed (9)`
  - `Tests 18 passed (18)`

Command:

```powershell
npm.cmd run format:check
```

Result:

- Exit code: `0`
- Output included: `All matched files use Prettier code style!`

## Additional Validation

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Result:

- Exit code: `0`
- Output included readiness checks for required files, npm scripts, and installed skills.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Result:

- Exit code: `0`
- Output included:
  - `npm script: lint`
  - `npm script: typecheck`
  - `npm script: test:unit`
  - `All matched files use Prettier code style!`

## State Update

Updated:

- `docs/04-agent-system/state/task-queue.yaml`
  - Added `phase-2-auth-dependency-repair`.
  - Marked `phase-2-auth-dependency-repair` done.
- `docs/04-agent-system/state/project-state.yaml`
  - `currentTask` reset to idle.
  - `handoff.nextRecommendedAction` remains `claim_phase_2_session_login_baseline`.
  - `handoff.lastSummaryPath` set to this evidence file.
