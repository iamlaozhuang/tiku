# Phase 2 Session Login Baseline Evidence

## Task

- Task id: `phase-2-session-login-baseline`
- Phase: `phase-2-user-auth`
- Branch: `codex/phase-2-auth-adapter-boundary`
- Evidence recorded at: `2026-05-17T21:59:10+08:00`

## Scope

Implemented the Phase 2 session/login baseline within the task queue boundary.

Created:

- `src/server/auth/session-boundary.ts`
- `src/server/auth/session-route.ts`
- `src/server/auth/session-route.test.ts`
- `src/server/repositories/session-repository.ts`
- `src/server/services/session-service.ts`
- `src/server/services/session-service.test.ts`
- `src/server/validators/session-login.ts`
- `src/server/validators/session-login.test.ts`
- `src/app/api/v1/sessions/route.ts`
- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-session-login-baseline.md`

Modified:

- `src/server/contracts/auth-contract.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Not changed by this task:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`

## Implementation Summary

- Added login input validation for phone/password request bodies.
- Added session credential adapter boundary for password verification and single-active-session creation.
- Added session user repository boundary for login lookup, failure counter updates, lockout updates, and login-failure reset.
- Added session service behavior for:
  - invalid login input
  - invalid credentials without field-specific leakage
  - three consecutive failed login attempts
  - five-minute lockout
  - successful seven-day session creation
  - current-session lookup delegation
- Added route handler factory for `POST /api/v1/sessions` and `GET /api/v1/sessions`.
- Added route file at `src/app/api/v1/sessions/route.ts` with the standard `{ code, message, data }` response shape.

## TDD Evidence

Command:

```powershell
npm.cmd run test:unit -- src/server/validators/session-login.test.ts src/server/services/session-service.test.ts src/server/auth/session-route.test.ts
```

RED result:

- Exit code: `1`
- Expected failure:
  - `Failed to resolve import "./session-login"`
  - `Failed to resolve import "./session-service"`
  - `Failed to resolve import "./session-route"`

GREEN result after implementation:

- Exit code: `0`
- Output included:
  - `Test Files 3 passed (3)`
  - `Tests 9 passed (9)`

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

First result:

- Exit code: `1`
- Cause:
  - `src/server/auth/session-route.test.ts`: fake service login input was `unknown`.
- Fix:
  - Explicitly narrowed the test fake input before reading `phone`.

Final result:

- Exit code: `0`
- Output included: `tsc --noEmit`

Command:

```powershell
npm.cmd run test:unit
```

Result:

- Exit code: `0`
- Output included:
  - `Test Files 12 passed (12)`
  - `Tests 27 passed (27)`

Command:

```powershell
Select-String -Path 'src\app\api\v1\sessions\route.ts' -Pattern 'code|message|data'
```

Result:

- Exit code: `0`
- Output matched:
  - `code: 503001`
  - `message: "Session runtime is not configured."`
  - `data: null`

## Additional Validation

Command:

```powershell
npm.cmd run format:check
```

First result:

- Exit code: `1`
- Cause:
  - `src/server/auth/session-route.ts`
  - `src/server/services/session-service.ts`
- Fix:
  - Ran local Prettier only for those two files.

Final result:

- Exit code: `0`
- Output included: `All matched files use Prettier code style!`

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

Final result:

- Exit code: `0`
- Output included:
  - `npm script: lint`
  - `npm script: typecheck`
  - `npm script: test:unit`
  - `All matched files use Prettier code style!`

Command:

```powershell
npm.cmd run build
```

Result:

- Exit code: `0`
- Output included:
  - `Compiled successfully`
  - `Route (app)`
  - `ƒ /api/v1/sessions`

## State Update

Updated:

- `docs/04-agent-system/state/task-queue.yaml`
  - `phase-2-session-login-baseline` marked `done`.
- `docs/04-agent-system/state/project-state.yaml`
  - `currentTask` reset to idle.
  - `handoff.nextRecommendedAction` set to `claim_phase_2_user_registration_baseline`.
  - `handoff.lastSummaryPath` set to this evidence file.

## Boundary Notes

- No schema or migration files were generated.
- No external URL exposes numeric database `id`.
- The login response includes `token` because US-01-02 requires token issuance.
- Generic current-session DTO mapping still excludes raw session token.
- The runtime route currently uses an unavailable-session handler until concrete Better Auth/DB wiring is added behind the adapter boundary.
