# Phase 7 Dev Database Migration And Seed Baseline Task Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:test-driven-development` for seed behavior and `superpowers:verification-before-completion` before commit, PR, merge, and closeout.

**Goal:** Provide a repeatable local dev database baseline with generated Drizzle migration evidence and deterministic, idempotent seed data for the Phase 7 MVP vertical slice.

**Architecture:** Keep schema ownership in `src/db/schema/**` and existing migrations under `drizzle/**`. Add a project-owned dev seed module under `src/db/**` plus a PowerShell wrapper under `scripts/**`, using the existing `postgres` and Better Auth packages without dependency changes.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, PostgreSQL 16 with pgvector, Better Auth, Vitest, PowerShell automation.

---

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest handoff/runtime inventory evidence: `docs/05-execution-logs/evidence/2026-05-21-phase-7-runtime-inventory-and-slice-contract.md`

## Scope

Allowed files from queue:

- `docs/05-execution-logs/task-plans/2026-05-21-phase-7-dev-database-migration-and-seed-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-21-phase-7-dev-database-migration-and-seed-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-21-phase-7-dev-database-migration-and-seed-baseline-security-review.md`
- `src/db/**`
- `drizzle/**`
- `scripts/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`

## Implementation Plan

1. Record startup, branch, and claim evidence.
2. Write RED unit tests in `src/db/dev-seed.test.ts` for the deterministic seed dataset:
   - exactly one `super_admin` admin account;
   - one `student` account;
   - one `organization`;
   - one active `personal_auth` authorization;
   - one published `paper` with an answerable objective `question`, `question_option`, `paper_section`, and `paper_question`;
   - mock AI `model_provider`, `model_config`, and `prompt_template` metadata;
   - no empty strings in seed payload values that should be `null`.
3. Run the focused RED test and record the expected failure.
4. Implement `src/db/dev-seed.ts`:
   - export stable seed identifiers and dataset builders for unit tests;
   - store Better Auth-compatible hashes for local-only dev passwords;
   - upsert records by stable public IDs or Better Auth IDs;
   - use `ON CONFLICT` to keep reruns idempotent;
   - avoid `drizzle-kit push`.
5. Add `scripts/db/Seed-DevDatabase.ps1` wrapper to run the TypeScript seed script with Node 22 type stripping.
6. Run focused GREEN tests.
7. Start/check Docker PostgreSQL + pgvector, run `drizzle-kit migrate`, run the seed script twice, and verify row counts stay stable.
8. Create the required security review artifact with verdict before merge.
9. Run queue validation commands:
   - `Test-TaskClaimReadiness.ps1`
   - `Invoke-QualityGate.ps1`
   - `npm.cmd run build`
   - `Test-NamingConventions.ps1`
   - `Test-GitCompletionReadiness.ps1 -BaseBranch master`
10. Commit, push branch, create PR, merge to `master`, sync local `master`, run master closeout gates, delete local/remote task branch, and record remote evidence.

## Risk Controls

- No dependency changes; package and lockfiles remain blocked.
- No `.env.example` changes; local `.env.local` remains ignored and uncommitted.
- No `drizzle-kit push`.
- Seed data uses deterministic public identifiers and idempotent upserts.
- Seed passwords are local-dev fixtures only, not production secrets.
- Security review covers schema, migration, seed, local runtime, credential fixture, data exposure, and rollback boundaries.
