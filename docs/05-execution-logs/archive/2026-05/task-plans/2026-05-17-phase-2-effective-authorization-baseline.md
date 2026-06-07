# Phase 2 Effective Authorization Baseline Plan

**Task id:** `phase-2-effective-authorization-baseline`

**Goal:** Implement the Phase 2 effective authorization baseline for `GET /api/v1/authorizations`, unifying active personal and organization authorization visibility for the current user while keeping the route, service, repository, contract, mapper, and validator boundaries clean.

## Context Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/stories/epic-01-user-auth.md#5-授权访问统一规则`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-redeem-code-auth-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-organization-auth-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-admin-employee-account-baseline.md`

## Queue Boundary

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-effective-authorization-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-effective-authorization-baseline.md`
- `src/app/api/v1/authorizations/**`
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

- Update project state to claim `phase-2-effective-authorization-baseline`.
- Mark only this queue item as in progress.
- Keep package, lockfile, schema, migration, and env files untouched.

### Task 2: RED Tests

- Add effective authorization mapper tests that combine personal and organization authorization rows into camelCase DTOs without numeric `id`.
- Add effective authorization service tests for:
  - personal and organization authorizations taking a union by profession/level;
  - expired, cancelled, disabled, and not-yet-started authorizations being excluded from effective access;
  - authorization display list preserving separate source entries.
- Add route adapter tests for `GET /api/v1/authorizations` using the standard `{ code, message, data }` envelope and current-user context.
- Run focused tests and record expected RED output before implementation.

### Task 3: GREEN Implementation

- Add effective authorization DTO contracts using camelCase API fields and public identifiers only.
- Add mapper functions from `personal_auth` / `org_auth` shaped repository rows to API DTOs.
- Add repository boundary types for listing current-user personal and organization authorizations plus employee organization context.
- Add service orchestration that calculates effective access as the union of valid personal and organization authorization sources.
- Add route-handler factory and placeholder runtime route that preserves the standard response shape until concrete DB/session wiring is introduced.

### Task 4: Validation and Evidence

- Run task validation commands:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run test:unit`
  - `Select-String -Path 'src\server\services\*.ts' -Pattern 'personal_auth|org_auth|authorization'`
- Run readiness, quality, and Git completion gates.
- Write evidence and update queue/state.
- Evaluate commit readiness before merge or push.

## Risk Defenses

- Route handlers stay thin and call service abstractions.
- JSON response fields remain camelCase and wrapped in `{ code, message, data }`.
- The service owns effective authorization rules; repositories own persistence and future atomic database concerns.
- DTOs expose only `publicId` and related public identifiers, never numeric database `id`.
- No schema, migration, dependency, package, lockfile, or env changes in this task.
