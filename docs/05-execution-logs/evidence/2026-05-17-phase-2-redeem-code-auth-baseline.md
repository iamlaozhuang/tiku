# Phase 2 Redeem Code Authorization Baseline Evidence

## Task

- Task id: `phase-2-redeem-code-auth-baseline`
- Phase: `phase-2-user-auth`
- Branch: `codex/phase-2-redeem-code-auth-baseline`
- Worktree: `F:\tiku\.worktrees\phase-2-redeem-code-auth-baseline`
- Base: `master`
- Evidence recorded at: `2026-05-18T12:23:28+08:00`
- Closeout updated at: `2026-05-18T12:47:00+08:00`
- Push evidence updated at: `2026-05-18T12:58:00+08:00`

## Scope

Implemented the Phase 2 personal redeem code authorization baseline within the task queue boundary.

Created:

- `src/server/validators/redeem-code.ts`
- `src/server/validators/redeem-code.test.ts`
- `src/server/contracts/authorization-contract.ts`
- `src/server/mappers/authorization-mapper.ts`
- `src/server/repositories/redeem-code-authorization-repository.ts`
- `src/server/services/redeem-code-authorization-service.ts`
- `src/server/services/redeem-code-authorization-service.test.ts`
- `src/server/services/redeem-code-route.ts`
- `src/server/services/redeem-code-route.test.ts`
- `src/app/api/v1/redeem-codes/redeem/route.ts`
- `src/app/api/v1/personal-auths/route.ts`
- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-redeem-code-auth-baseline.md`

Modified:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Not changed by this task:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`

## Implementation Summary

- Added redeem code input validation that trims input, uppercases codes, and rejects invalid empty or non-string values.
- Added authorization DTO contracts for redeem code redemption and personal authorization listing.
- Added mapper functions that convert snake_case repository rows into camelCase API DTOs without exposing numeric `id`.
- Added repository boundary types for redeem code lookup, atomic redemption, and personal authorization listing.
- Added service behavior for:
  - invalid redeem code input
  - missing redeem code
  - already used redeem code
  - expired redeem deadline
  - successful redemption returning `redeemCode` and `personalAuth`
  - current-user personal authorization listing
- Added route handler factories for `POST /api/v1/redeem-codes/redeem` and `GET /api/v1/personal-auths`.
- Added placeholder runtime route files that preserve the standard response envelope until concrete DB/session wiring is introduced.

## TDD Evidence

Command:

```powershell
npm.cmd run test:unit -- src/server/validators/redeem-code.test.ts src/server/services/redeem-code-authorization-service.test.ts src/server/services/redeem-code-route.test.ts
```

Initial sandbox result:

- Exit code: `1`
- Cause: sandbox blocked Vitest startup with `spawn EPERM`.
- Follow-up: reran the same command with approved escalation.

RED result:

- Exit code: `1`
- Expected failures:
  - `Failed to resolve import "./redeem-code"`
  - `Failed to resolve import "./redeem-code-authorization-service"`
  - `Failed to resolve import "./redeem-code-route"`

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
- Final output included `eslint` with no warnings.

Command:

```powershell
npm.cmd run typecheck
```

Result:

- Exit code: `0`
- Output included `tsc --noEmit`.

Command:

```powershell
npm.cmd run test:unit
```

Result:

- Exit code: `0`
- Output included:
  - `Test Files 18 passed (18)`
  - `Tests 42 passed (42)`

Command:

```powershell
Select-String -Path 'src\server\services\*.ts' -Pattern 'redeem_code|personal_auth|authorization'
```

Result:

- Exit code: `0`
- Output matched the redeem code authorization service and route coverage, including `redeem_code`, `personal_auth`, and `authorization` terms.

## Additional Validation

Command:

```powershell
npm.cmd run format:check
```

First result:

- Exit code: `1`
- Cause: Prettier reported four new files requiring formatting.
- Recovery: formatted only the four reported task files with local Prettier.

Final result:

- Exit code: `0`
- Output included `All matched files use Prettier code style!`

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Result:

- Exit code: `0`
- Output included required file checks, npm script checks, agent-system script checks, and installed skill path checks.

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
  - `Test Files 18 passed (18)`
  - `Tests 42 passed (42)`
  - `All matched files use Prettier code style!`

Command:

```powershell
npm.cmd run build
```

First result:

- Exit code: `1`
- Cause: the fresh worktree lacked `node_modules`, so Next/Turbopack could not resolve `next/package.json`.

Recovery command:

```powershell
corepack pnpm@10 install --frozen-lockfile
```

Recovery result:

- First attempt timed out before `node_modules\next\package.json` existed.
- Second attempt completed successfully.
- Output included `Lockfile is up to date, resolution step is skipped`.
- `package.json` and lockfiles remained unchanged.

Final build result:

- Exit code: `0`
- Output included:
  - `Compiled successfully`
  - `ƒ /api/v1/personal-auths`
  - `ƒ /api/v1/redeem-codes/redeem`

## State Update

Updated:

- `docs/04-agent-system/state/task-queue.yaml`
  - `phase-2-redeem-code-auth-baseline` marked `done`.
- `docs/04-agent-system/state/project-state.yaml`
  - `currentTask` reset to idle.
  - `handoff.nextRecommendedAction` set to `claim_phase_2_organization_auth_baseline`.
  - `handoff.lastSummaryPath` set to this evidence file.

## Git Closeout

- commit: local task commit created with message `feat(auth): add redeem code authorization baseline`
- taskCommit: `65d003b`
- merge: user approved merge; fast-forward merged into local `master` at `2026-05-18T12:43:00+08:00`
- mergedHead: `65d003b`
- push: user approved push to `origin/master`; pushed `5dac506..57fa80c` with result `master -> master`; final push evidence commit will be pushed immediately after this record
- cleanup: branch `codex/phase-2-redeem-code-auth-baseline` deleted; residual worktree directory `F:\tiku\.worktrees\phase-2-redeem-code-auth-baseline` removed after confirming it was under `.worktrees/`

## Commit Evaluation

Command:

```powershell
git status --short --branch
```

Result:

- Exit code: `0`
- Output after initial commit: `## codex/phase-2-redeem-code-auth-baseline`

Command:

```powershell
git diff --name-only origin/master..HEAD
```

Result:

- Exit code: `0`
- Output contained only task-scoped files from the allowed queue boundary.

## Post-Merge Validation on Master

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Result:

- Exit code: `0`
- Output included required file checks, npm script checks, agent-system script checks, and installed skill path checks.

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
  - `Test Files 18 passed (18)`
  - `Tests 42 passed (42)`
  - `All matched files use Prettier code style!`

Command:

```powershell
npm.cmd run build
```

Result:

- Exit code: `0`
- Output included:
  - `Compiled successfully`
  - `ƒ /api/v1/personal-auths`
  - `ƒ /api/v1/redeem-codes/redeem`

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result:

- Exit code: `0`
- Output included:
  - branch: `master`
  - head: `65d003b`
  - status: `master...origin/master [ahead 1]`
  - upstream: `origin/master`
  - leftRightCount: `0 1`
  - result: `git completion readiness inventory completed`

## Push And Cleanup Validation

Command:

```powershell
git fetch origin
```

Result:

- Exit code: `0`

Command:

```powershell
git rev-list --left-right --count origin/master...master
```

Pre-push result:

- Exit code: `0`
- Output: `0 2`

Command:

```powershell
git push origin master
```

Result:

- Exit code: `0`
- Output included: `5dac506..57fa80c  master -> master`

Command:

```powershell
git worktree remove .worktrees\phase-2-redeem-code-auth-baseline
```

Result:

- Exit code: `1`
- Cause: Git deregistered the worktree but Windows left the directory non-empty because of local dependency residue.
- Recovery: resolved and confirmed the path was under `F:\tiku\.worktrees`, then removed the residual directory with PowerShell long-path cleanup.

Command:

```powershell
Test-Path 'F:\tiku\.worktrees\phase-2-redeem-code-auth-baseline'
```

Result:

- Exit code: `0`
- Output: `False`

Command:

```powershell
git branch -d codex/phase-2-redeem-code-auth-baseline
```

Result:

- Exit code: `0`
- Output included `Deleted branch codex/phase-2-redeem-code-auth-baseline`.

Command:

```powershell
git worktree prune
```

Result:

- Exit code: `0`

## Boundary Notes

- No schema or migration files were generated.
- No dependencies were added, removed, or upgraded.
- No external URL exposes numeric database `id`.
- The runtime routes currently return an unauthenticated standard response until concrete session/DB wiring is added behind approved boundaries.
