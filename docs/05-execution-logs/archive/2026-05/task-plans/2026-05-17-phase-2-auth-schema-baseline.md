# Phase 2 Auth Schema Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Phase 2 user auth Drizzle schema and TypeScript domain model baseline approved by `user-auth-contract.md`.

**Architecture:** Keep ORM schema source in `src/db/schema/` and domain row/model types in `src/server/models/`. Better Auth adapter tables stay isolated behind `auth_` table names, while Tiku business authorization entities remain project-owned schema.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM PostgreSQL schema definitions, Vitest.

---

## Context Read

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/02-architecture/interfaces/user-auth-contract.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-auth-schema-and-permission-model-approval.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/03-standards/glossary.yaml`

## Queue Boundary

Task id: `phase-2-auth-schema-baseline`

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-auth-schema-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-auth-schema-baseline.md`
- `src/db/schema/**`
- `src/server/models/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/app/**`
- `drizzle/**`
- `.env.example`

## Implementation Tasks

### Task 1: Claim Task and Preserve Boundaries

- [x] Verify current handoff is `claim_phase_2_auth_schema_baseline`.
- [x] Confirm dependency `phase-2-auth-schema-and-permission-model-approval` is `done`.
- [x] Create task branch `codex/phase-2-auth-schema-baseline`.
- [x] Update project state to set current task, plan path, evidence path, and branch.

### Task 2: RED Schema Contract Tests

**Files:**

- Create: `src/db/schema/auth.test.ts`
- Create: `src/server/models/auth.test.ts`

- [x] Add Vitest assertions for required table names, exported columns, and index naming for Better Auth adapter tables and Tiku business tables.
- [x] Add model tests to prove domain rows expose `snake_case` database fields, API-safe public identifiers, and enum values from the approved glossary.
- [x] Run `npm.cmd run test:unit -- src/db/schema/auth.test.ts src/server/models/auth.test.ts` and record the expected failing result before implementation.

### Task 3: GREEN Drizzle Schema

**Files:**

- Create: `src/db/schema/auth.ts`
- Modify: `src/db/schema/index.ts`

- [x] Define `auth_user`, `auth_session`, `auth_account`, and `auth_verification` with `auth_` prefixes and snake_case columns.
- [x] Define `user`, `student`, `admin`, `organization`, `employee`, `redeem_code`, `personal_auth`, `org_auth`, and `org_auth_organization`.
- [x] Add primary keys, unique indexes, foreign-key indexes, status/tier/type indexes, and Drizzle relations needed by later repository tasks.
- [x] Export the schema from `src/db/schema/index.ts`.

### Task 4: GREEN Domain Models

**Files:**

- Create: `src/server/models/auth.ts`

- [x] Export enum union types for user/auth/admin/organization/redeem-code values.
- [x] Export Drizzle-inferred row and insert types for every auth schema entity.
- [x] Keep database row types internal-facing and do not introduce API DTOs in this task.

### Task 5: Verification and Evidence

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-05-17-phase-2-auth-schema-baseline.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [x] Run `npm.cmd run lint`.
- [x] Run `npm.cmd run typecheck`.
- [x] Run `Select-String -Path 'src\db\schema\*.ts' -Pattern 'user|student|admin|organization|employee|session'`.
- [x] Write evidence with command outputs.
- [x] Mark `phase-2-auth-schema-baseline` done and set next recommended action to `claim_phase_2_auth_adapter_boundary`.

## Risk Defenses

- No dependency or lockfile edits.
- No generated `drizzle/**` migration files.
- No route handler or `src/app/**` implementation.
- No `.env.example` or secret wiring.
- Internal numeric `id` stays database-only; schema includes `public_id` for URL-safe business identifiers.
- Better Auth adapter tables are isolated as infrastructure schema and are not exposed as Tiku API resources.
