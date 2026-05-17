# Phase 2 Session Login Baseline Plan

**Task id:** `phase-2-session-login-baseline`

**Goal:** Implement the Phase 2 session/login baseline with thin REST route handlers and service-layer behavior for phone/password login, session lookup, single-active-session adapter boundaries, and lockout rules.

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/stories/epic-01-user-auth.md#us-01-02-用户登录与会话管理`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-auth-adapter-boundary.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-auth-dependency-repair.md`

## Queue Boundary

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-session-login-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-session-login-baseline.md`
- `src/app/api/v1/sessions/**`
- `src/server/auth/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`

## Implementation Tasks

### Task 1: Claim Task

- Update project state to claim `phase-2-session-login-baseline`.
- Keep package, lockfile, schema, migration, and env files untouched.

### Task 2: RED Tests

- Add login input validator tests for phone/password.
- Add session service tests for invalid credentials, 3-failure lockout, active lock rejection, successful login, 7-day expiry, and current session lookup.
- Add route adapter tests for standard response envelopes.
- Run focused tests and record expected RED output.

### Task 3: GREEN Implementation

- Add login DTO contract with `token`, API-safe auth context, and ISO expiry.
- Extend auth adapter boundaries for credential verification and single-active-session creation.
- Extend auth repository boundaries for login lookup and failure/lock counters.
- Add session service orchestration.
- Add route-handler factory and `/api/v1/sessions` route exports.

### Task 4: Validation and Evidence

- Run task validation commands:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run test:unit`
  - `Select-String -Path 'src\app\api\v1\sessions\**\*.ts' -Pattern 'code|message|data'`
- Run readiness and quality gates.
- Write evidence and update queue/state.

## Risk Defenses

- Route handlers stay thin and call service/handler abstractions.
- Numeric database `id` is not exposed in response DTOs.
- Login token is exposed only in the login response, not in generic current-session auth context mapping.
- Adapter boundary owns single-active-session behavior; feature code does not directly depend on Better Auth shapes.
- No schema/migration/env changes in this task.
