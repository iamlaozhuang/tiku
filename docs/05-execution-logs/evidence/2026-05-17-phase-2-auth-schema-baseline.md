# Phase 2 Auth Schema Baseline Evidence

## Task

- Task id: `phase-2-auth-schema-baseline`
- Phase: `phase-2-user-auth`
- Branch: `codex/phase-2-auth-schema-baseline`
- Evidence recorded at: `2026-05-17T17:29:25+08:00`

## Scope

Implemented the approved Phase 2 auth schema/model baseline within the task queue boundary.

Created:

- `src/db/schema/auth.ts`
- `src/db/schema/auth.test.ts`
- `src/server/models/auth.ts`
- `src/server/models/auth.test.ts`
- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-auth-schema-baseline.md`

Modified:

- `src/db/schema/index.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Not changed:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `drizzle/**`
- `src/app/**`
- `.env.example`

## Implementation Summary

- Added Better Auth adapter-owned schema tables with `auth_` prefixes:
  - `auth_user`
  - `auth_session`
  - `auth_account`
  - `auth_verification`
- Added Tiku business schema tables:
  - `user`
  - `student`
  - `admin`
  - `organization`
  - `employee`
  - `redeem_code`
  - `personal_auth`
  - `org_auth`
  - `org_auth_organization`
- Added schema-level primary keys, unique indexes, FK indexes, and Drizzle relations.
- Added Drizzle-inferred domain row and insert model types in `src/server/models/auth.ts`.
- Kept row model fields in database `snake_case`; API JSON DTOs remain out of scope for this task.

## TDD Evidence

Command:

```powershell
npm.cmd run test:unit -- src/db/schema/auth.test.ts src/server/models/auth.test.ts
```

RED result:

- Exit code: `1`
- Expected failure:
  - `Failed to resolve import "./auth" from "src/db/schema/auth.test.ts"`
  - `Failed to resolve import "./auth" from "src/server/models/auth.test.ts"`

GREEN result after implementation:

- Exit code: `0`
- Output included:
  - `Test Files 2 passed (2)`
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
Select-String -Path 'src\db\schema\*.ts' -Pattern 'user|student|admin|organization|employee|session'
```

Result:

- Exit code: `0`
- Matched auth schema and tests for `user`, `student`, `admin`, `organization`, `employee`, and `session`.

## Additional Validation

Command:

```powershell
npm.cmd run test:unit
```

Result:

- Exit code: `0`
- Output included:
  - `Test Files 9 passed (9)`
  - `Tests 19 passed (19)`

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
  - `phase-2-auth-schema-baseline` marked `done`.
- `docs/04-agent-system/state/project-state.yaml`
  - `handoff.nextRecommendedAction` set to `claim_phase_2_auth_adapter_boundary`.
  - `handoff.lastSummaryPath` set to this evidence file.

## Boundary Notes

- No migration files were generated.
- No dependency or lockfile changes were introduced by this task.
- Better Auth raw table rows remain isolated behind `auth_` table names.
- Tiku business tables use `public_id` for future external URL identifiers.
