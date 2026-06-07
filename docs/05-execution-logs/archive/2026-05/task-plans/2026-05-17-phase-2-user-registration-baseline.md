# Phase 2 User Registration Baseline Plan

**Task id:** `phase-2-user-registration-baseline`

**Goal:** Implement the Phase 2 personal user registration baseline for `POST /api/v1/users`, covering phone/password/name validation, duplicate phone rejection, registration orchestration, API-safe DTO mapping, and the standard response envelope.

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/stories/epic-01-user-auth.md#us-01-01-个人用户注册`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-session-login-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-17-git-submit-push-hardening.md`

## Queue Boundary

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-user-registration-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-user-registration-baseline.md`
- `src/app/api/v1/users/**`
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

- Update project state to claim `phase-2-user-registration-baseline`.
- Keep package, lockfile, schema, migration, and env files untouched.

### Task 2: RED Tests

- Add registration input validator tests for phone, password, and name.
- Add registration service tests for invalid input, duplicate phone, successful personal user creation, and redirect target metadata.
- Add route adapter tests for standard `{ code, message, data }` envelopes.
- Run focused tests and record expected RED output.

### Task 3: GREEN Implementation

- Add registration request and response DTO contract using camelCase API fields.
- Extend the auth adapter boundary with password hashing for user creation.
- Extend repository boundary for phone lookup and personal user creation.
- Add registration service orchestration that never exposes numeric database IDs in URL-facing data.
- Add route-handler factory and `/api/v1/users` route export.

### Task 4: Validation and Evidence

- Run task validation commands:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run test:unit`
  - `Select-String -Path 'src\server\validators\*.ts' -Pattern 'phone|password'`
- Run readiness, quality, and Git completion gates.
- Write evidence and update queue/state.
- Evaluate commit readiness before any merge or push decision.

## Risk Defenses

- Route handlers stay thin and call service/handler abstractions.
- JSON response fields remain camelCase and wrapped in `{ code, message, data }`.
- Duplicate phone checks happen in the service/repository boundary; future DB uniqueness remains schema-owned outside this task.
- Password handling stays behind the auth adapter boundary; no plaintext password is returned.
- No schema, migration, dependency, package, lockfile, or env changes in this task.
