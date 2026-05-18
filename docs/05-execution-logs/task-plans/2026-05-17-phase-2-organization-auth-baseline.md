# Phase 2 Organization Auth Baseline Plan

**Task id:** `phase-2-organization-auth-baseline`

**Goal:** Implement the Phase 2 organization and org authorization baseline for organization tree management and enterprise authorization contracts.

## Context Read

- `AGENTS.md`
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
- `docs/01-requirements/stories/epic-01-user-auth.md#4-企业组织与授权`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-redeem-code-auth-baseline.md`

## Queue Boundary

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-organization-auth-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-organization-auth-baseline.md`
- `src/app/api/v1/organizations/**`
- `src/app/api/v1/org-auths/**`
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

- Update project state to claim `phase-2-organization-auth-baseline`.
- Mark only this queue item as in progress.
- Keep package, lockfile, schema, migration, and env files untouched.

### Task 2: RED Tests

- Add organization validator tests for create/update input, parent cycle rejection inputs, cascade disable input, and 4-level depth guard.
- Add org authorization validator tests for scope type, profession, level, account quota, date range, and specified organization list validation.
- Add service tests for creating an organization, rejecting excessive depth, rejecting circular parent changes, disabling organizations with cascade metadata, creating org auths, rejecting overlapping org auth scopes, and cancelling org auths.
- Add route adapter tests for `POST /api/v1/organizations`, `PATCH /api/v1/organizations/{publicId}`, `POST /api/v1/organizations/{publicId}/disable`, `POST /api/v1/org-auths`, and `POST /api/v1/org-auths/{publicId}/cancel`.
- Run focused tests and record expected RED output.

### Task 3: GREEN Implementation

- Add organization and org auth DTO contracts using camelCase API fields.
- Add mapper functions from organization / org_auth shaped rows to API DTOs without exposing numeric IDs.
- Add repository boundary types for organization lookup/mutation, org auth creation, overlap checks, and cancellation.
- Add service orchestration that enforces max depth and parent cycle rules in the service boundary.
- Add route-handler factories and placeholder runtime routes that preserve standard response envelopes until concrete DB/session wiring is introduced.

### Task 4: Validation and Evidence

- Run task validation commands:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run test:unit`
  - `Select-String -Path 'src\server\services\*.ts' -Pattern 'organization|org_auth|auth_scope_type'`
- Run readiness, quality, build, and Git completion gates.
- Write evidence and update queue/state.
- Evaluate commit readiness before merge or push.

## Risk Defenses

- Route handlers stay thin and call service abstractions.
- JSON response fields remain camelCase and wrapped in `{ code, message, data }`.
- Repository boundaries model atomic overlap/quota concerns without introducing migrations or handwritten SQL in this task.
- Organization and org auth DTOs expose public identifiers only, never numeric database `id`.
- No schema, migration, dependency, package, lockfile, or env changes in this task.
