# Phase 2 Auth Adapter Boundary Implementation Plan

**Task id:** `phase-2-auth-adapter-boundary`

**Goal:** Establish the server-side auth adapter boundary that converts external auth session state into Tiku domain-safe auth context without leaking database rows or numeric primary keys to transport-facing layers.

## Context Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/03-standards/git-workflow.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-auth-schema-baseline.md`
- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-auth-schema-baseline.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/03-standards/glossary.yaml`

## Queue Boundary

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-auth-adapter-boundary.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-auth-adapter-boundary.md`
- `src/server/auth/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `src/lib/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`

## Important Recovery Note

`task-queue.yaml` marks the Better Auth dependency installation and schema/permission approval tasks as `done`, but the current checkout does not contain `better-auth`, `@better-auth/drizzle-adapter`, `docs/02-architecture/interfaces/user-auth-contract.md`, or the referenced approval evidence files. Because this task explicitly blocks dependency and schema changes, implementation will define the internal Tiku boundary interfaces and tests without importing missing runtime packages.

## Implementation Tasks

### Task 1: Claim Task and Preserve Boundaries

- Verify current branch is `codex/phase-2-auth-adapter-boundary`.
- Update project state to claim current task, plan path, evidence path, and branch.
- Keep package files, lockfiles, schema files, migrations, and route handlers untouched.

### Task 2: RED Boundary Tests

- Add validator tests for bearer-token normalization.
- Add mapper tests proving auth context DTOs use camelCase, ISO timestamps, and public identifiers only.
- Add service tests proving missing, expired, and valid sessions return standard `{ code, message, data }` responses.
- Run focused unit tests and record the expected RED output.

### Task 3: GREEN Boundary Implementation

- Add auth adapter interface types under `src/server/auth/`.
- Add auth API contract types under `src/server/contracts/`.
- Add repository boundary types under `src/server/repositories/`.
- Add mapper and validator helpers under their existing layers.
- Add auth service orchestration under `src/server/services/`.

### Task 4: Verification and Evidence

- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run `npm.cmd run test:unit`.
- Write evidence with command results.
- Mark this task done and set `handoff.nextRecommendedAction` to `claim_phase_2_session_login_baseline` only if gates pass.

## Risk Defenses

- No dependency introduction in this task.
- No `src/db/schema/**` or `drizzle/**` changes.
- No API route handlers in this task.
- External-facing DTOs expose `publicId` and never numeric `id`.
- Better Auth-specific runtime integration remains behind the adapter interface until package state is reconciled by an approved task.
