# Phase 2 Redeem Code Authorization Baseline Plan

**Task id:** `phase-2-redeem-code-auth-baseline`

**Goal:** Implement the Phase 2 personal redeem code authorization baseline for `POST /api/v1/redeem-codes/redeem` and `GET /api/v1/personal-auths`, covering redeem code validation, redemption outcome mapping, personal authorization listing contracts, and standard API envelopes.

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
- `docs/01-requirements/stories/epic-01-user-auth.md#3-个人卡密授权`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-user-registration-baseline.md`

## Queue Boundary

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-redeem-code-auth-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-redeem-code-auth-baseline.md`
- `src/app/api/v1/redeem-codes/**`
- `src/app/api/v1/personal-auths/**`
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

- Update project state to claim `phase-2-redeem-code-auth-baseline`.
- Mark only this queue item as in progress.
- Keep package, lockfile, schema, migration, and env files untouched.

### Task 2: RED Tests

- Add redeem code input validator tests for trimming, uppercasing, and rejecting invalid empty/non-string code values.
- Add redeem code authorization service tests for invalid input, missing code, used code, expired deadline, successful redemption, and personal authorization listing.
- Add route adapter tests for `POST /api/v1/redeem-codes/redeem` and `GET /api/v1/personal-auths` standard `{ code, message, data }` envelopes.
- Run focused tests and record expected RED output.

### Task 3: GREEN Implementation

- Add redeem code and personal authorization DTO contracts using camelCase API fields.
- Add mapper functions from `redeem_code` / `personal_auth` shaped rows to API DTOs without exposing numeric IDs.
- Add repository boundary types for finding redeem codes, atomically redeeming a code, and listing user personal authorizations.
- Add service orchestration that distinguishes missing, used, and expired redeem codes.
- Add route-handler factories and placeholder runtime routes that preserve the standard response shape until concrete DB/session wiring is introduced.

### Task 4: Validation and Evidence

- Run task validation commands:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run test:unit`
  - `Select-String -Path 'src\server\services\*.ts' -Pattern 'redeem_code|personal_auth|authorization'`
- Run readiness, quality, and Git completion gates.
- Write evidence and update queue/state.
- Evaluate commit readiness before any merge or push decision.

## Risk Defenses

- Route handlers stay thin and call service abstractions.
- JSON response fields remain camelCase and wrapped in `{ code, message, data }`.
- Redeem code status checks are modeled in service tests; actual concurrent redemption remains repository/DB-owned for future concrete persistence wiring.
- Personal auth list responses expose `publicId`, `profession`, `level`, `startsAt`, `expiresAt`, and `status`, never numeric database `id`.
- No schema, migration, dependency, package, lockfile, or env changes in this task.
