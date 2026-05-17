# Phase 2 Auth Adapter Boundary Evidence

## Task

- Task id: `phase-2-auth-adapter-boundary`
- Phase: `phase-2-user-auth`
- Branch: `codex/phase-2-auth-adapter-boundary`
- Evidence recorded at: `2026-05-17T21:23:25+08:00`

## Scope

Implemented the internal auth adapter boundary within the task queue boundary.

Created:

- `src/server/auth/auth-boundary.ts`
- `src/server/contracts/auth-contract.ts`
- `src/server/repositories/auth-repository.ts`
- `src/server/validators/auth-session.ts`
- `src/server/validators/auth-session.test.ts`
- `src/server/mappers/auth-mapper.ts`
- `src/server/mappers/auth-mapper.test.ts`
- `src/server/services/auth-service.ts`
- `src/server/services/auth-service.test.ts`
- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-auth-adapter-boundary.md`

Modified:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Not changed:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`
- `src/app/**`

## Recovery Note

`task-queue.yaml` marks the Better Auth dependency installation and schema/permission approval tasks as `done`, but the current checkout does not contain `better-auth`, `@better-auth/drizzle-adapter`, `docs/02-architecture/interfaces/user-auth-contract.md`, or the referenced approval evidence files. Because this task blocks dependency and schema changes, this implementation defines the Tiku-owned adapter boundary without importing missing runtime packages.

## Implementation Summary

- Added `AuthAdapterBoundary` as the integration seam for external auth session lookup.
- Added `AuthUserRepository` as the repository boundary for resolving active Tiku users by `auth_user_id`.
- Added bearer-token normalization with strict malformed-header handling.
- Added auth context mapping from internal rows to API-safe camelCase DTOs.
- Added `createAuthService` to orchestrate missing, expired, invalid, and valid session outcomes through the standard `{ code, message, data }` response envelope.
- Kept numeric `id`, `auth_user_id`, and raw session token out of API DTOs.

## TDD Evidence

Command:

```powershell
npm.cmd run test:unit -- src/server/validators/auth-session.test.ts src/server/mappers/auth-mapper.test.ts src/server/services/auth-service.test.ts
```

RED result:

- Exit code: `1`
- Expected failure:
  - `Failed to resolve import "./auth-session"`
  - `Failed to resolve import "./auth-mapper"`
  - `Failed to resolve import "./auth-service"`

GREEN result after implementation:

- Exit code: `0`
- Output included:
  - `Test Files 3 passed (3)`
  - `Tests 6 passed (6)`

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

First result:

- Exit code: `1`
- Cause: `format:check` reported `src/server/validators/auth-session.ts`.
- Fix: formatted the chained token normalization expression.

Final result:

- Exit code: `0`
- Output included:
  - `npm script: lint`
  - `npm script: typecheck`
  - `npm script: test:unit`
  - `All matched files use Prettier code style!`

Command:

```powershell
npm.cmd run format:check
```

Result:

- Exit code: `0`
- Output included: `All matched files use Prettier code style!`

## State Update

Updated:

- `docs/04-agent-system/state/task-queue.yaml`
  - `phase-2-auth-adapter-boundary` marked `done`.
- `docs/04-agent-system/state/project-state.yaml`
  - `currentTask` reset to idle.
  - `handoff.nextRecommendedAction` set to `claim_phase_2_session_login_baseline`.
  - `handoff.lastSummaryPath` set to this evidence file.

## Boundary Notes

- No dependency or lockfile changes were introduced.
- No Drizzle schema or migration files were generated.
- No route handlers were added.
- Better Auth runtime integration remains behind the adapter interface until the missing dependency state is reconciled by an approved task.
