# Task Plan: organization-training-admin-visible-scope-local-fixture-contract-repair

- taskId: `organization-training-admin-visible-scope-local-fixture-contract-repair`
- date: `2026-06-18`
- branch: `codex/organization-training-local-experience-chain`
- executionProfile: `local_seed_fixture_tdd_plus_scoped_local_full_flow`

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-18-organization-training-draft-source-context-local-migration-execution-approval.md`
- `src/db/dev-seed.ts`
- `src/db/dev-seed.test.ts`
- `e2e/organization-training-local-full-flow.spec.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/services/organization-training-route.ts`

## Current Local Fact

The scoped organization-training local full-flow reaches `POST /api/v1/organization-trainings` and receives `409080`.
The prior redacted diagnostic shows the seed admin exists but has no `admin_organization` visible root in the current
local database. The repository route contract intentionally fails closed when the trusted visible organization scope
source is missing, so this repair must not infer visibility from request body organization ids.

## Scope

Repair the local development fixture contract so the deterministic seed admin has a deterministic visible organization
root for the deterministic seed organization. Then rerun the scoped local full-flow.

Allowed implementation surfaces:

- `src/db/dev-seed.ts`
- `src/db/dev-seed.test.ts`
- `e2e/organization-training-local-full-flow.spec.ts`
- coverage matrix, project state, task queue, task plan, evidence, and audit files

Inherited local-experience chain files are present in the dirty worktree and are allowed only as existing prerequisites
for rerunning the scoped flow:

- `src/app/(admin)/content/organization-training/page.tsx`
- `src/app/(admin)/organization-training/page.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`

## Non-Goals

- No `.env*` modification or secret output.
- No package or lockfile changes.
- No schema, drizzle, or migration edits.
- No `drizzle-kit push`.
- No destructive database operation.
- No provider/model, staging/prod/cloud/deploy/payment/external-service, PR, force-push, or Cost Calibration Gate work.
- No `experience_closed` claim from this task alone.

## TDD Plan

1. RED: add a focused `src/db/dev-seed.test.ts` expectation requiring a deterministic `adminOrganization` assignment
   from the seed admin to the seed organization. Run the focused unit test and capture the expected failure.
2. GREEN: add `adminOrganization` to the seed dataset and insert it idempotently into `admin_organization` after both
   the admin and organization rows are available.
3. Run the focused seed unit test.
4. Run the local DB capability gate and the idempotent local dev seed script. Evidence must redact database target
   values and row data.
5. Rerun the scoped local full-flow e2e and update coverage matrix/state/evidence/audit based on the actual result.
6. Run scoped formatting, lint, typecheck, `git diff --check`, and Module Run v2 readiness gates where applicable.

## Risk Controls

- The repair writes only a deterministic local seed fixture relation and uses `on conflict do nothing` semantics.
- The local DB operation is non-destructive and local-dev-only.
- The e2e organization selection continues to use public IDs and must not expose internal numeric ids.
- Evidence must not include credentials, session tokens, database URLs, Authorization headers, public ID lists, row data,
  provider payloads, raw prompts, raw answers, or full paper/material content.
