# Phase 2 Admin Employee Account Baseline Plan

**Task id:** `phase-2-admin-employee-account-baseline`

**Goal:** Implement the Phase 2 single employee account creation baseline for admin-created enterprise employees.

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
- `docs/01-requirements/stories/epic-01-user-auth.md#us-01-03-企业员工账号创建单个`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-redeem-code-auth-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-organization-auth-baseline.md`

## Queue Boundary

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-admin-employee-account-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-admin-employee-account-baseline.md`
- `src/app/api/v1/employees/**`
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

- Work on branch `codex/phase-2-admin-employee-account-baseline` in `F:\tiku\.worktrees\phase-2-admin-employee-account-baseline`.
- Update project state to claim `phase-2-admin-employee-account-baseline`.
- Mark only this queue item as in progress.
- Keep package, lockfile, schema, migration, and env files untouched.

### Task 2: RED Tests

- Add employee validator tests for phone, name, initial password, and `organizationPublicId`.
- Add mapper tests to confirm employee rows become camelCase API DTOs and numeric `id` is not exposed.
- Add service tests for:
  - creating a new employee account when the phone does not exist;
  - binding an existing personal user when the phone exists without an employee;
  - rejecting a phone already bound to another organization;
  - rejecting missing organizations;
  - rejecting invalid input.
- Add route adapter tests for `POST /api/v1/employees`.
- Run focused tests and record expected RED output before implementation.

### Task 3: GREEN Implementation

- Add employee account DTO contracts using camelCase API fields and public identifiers only.
- Add mapper functions from `employee` shaped repository rows to API DTOs.
- Add repository boundary types for finding users by phone, organization lookup, creating new employee users, and binding existing users.
- Add service orchestration that validates input, checks organization existence, delegates credential creation only for new users, and enforces single-organization employee binding.
- Add route-handler factory and placeholder runtime route for `POST /api/v1/employees`.

### Task 4: Validation and Evidence

- Run task validation commands:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run test:unit`
  - `Select-String -Path 'src\server\services\*.ts' -Pattern 'employee|organization'`
- Run readiness, quality, build, and Git completion gates.
- Write evidence and update queue/state.
- Evaluate commit readiness before merge or push.

## Risk Defenses

- Route handlers stay thin and call service abstractions.
- JSON response fields remain camelCase and wrapped in `{ code, message, data }`.
- DTOs expose public identifiers only and never expose numeric database `id`.
- Existing users are bound only when they have no employee row; cross-organization binding returns an explicit conflict response.
- Repository boundaries model account and employee mutations without introducing migrations or handwritten SQL in this task.
- No schema, migration, dependency, package, lockfile, or env changes in this task.
