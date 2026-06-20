# Task Plan: organization-training-admin-visible-scope-local-fixture-contract-repair

## Task

- Task id: `organization-training-admin-visible-scope-local-fixture-contract-repair`
- Branch: `codex/organization-training-fixture-ui-response-mapping-repair`
- Source blocked task: `organization-training-admin-visible-scope-local-fixture-contract-repair`
- Goal: validate or repair the historical fixture/UI response mapping blocker in the organization-training local
  full-flow without schema, migration, dependency, provider, or destructive local DB work.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- all ADRs under `docs/02-architecture/adr/`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/05-execution-logs/evidence/2026-06-18-organization-training-admin-visible-scope-local-fixture-contract-repair.md`
- current organization-training route/runtime repair evidence from 2026-06-20

## Allowed Files

- `src/db/dev-seed.ts`
- `src/db/dev-seed.test.ts`
- `e2e/organization-training-local-full-flow.spec.ts`
- `src/app/(admin)/content/organization-training/page.tsx`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- this task's project-state, task-queue, plan, evidence, and audit files.

## Blocked Files And Gates

- Blocked files: `.env*`, package and lockfiles, `src/db/schema/**`, `drizzle/**`, unrelated `src/server/**`,
  `scripts/**`, `playwright-report/**`, and `test-results/**`.
- Blocked gates: schema/drizzle/migration changes, migration execution, destructive local DB writes, provider/model
  calls, env/secret reads or writes, dependency changes, headed/debug browser mode, staging/prod/cloud/deploy/payment/
  external-service, PR, force-push, and Cost Calibration Gate.

## Plan

1. Run project status, next action, seed proposal, and localhost-only localFullFlow capability gate.
2. Run focused admin fixture/UI unit tests and scoped organization-training Playwright list/full-flow validation.
3. If current validation passes, do not change source. If the response mapping blocker still reproduces, repair only the
   smallest allowed fixture/UI/e2e contract surface.
4. Run prettier, lint, typecheck, diff check, pre-commit hardening, module closeout readiness, and pre-push readiness.
5. Record redacted command evidence only, then create validation and closeout commits.

## Risk Controls

- Do not read or output secrets, tokens, database URLs, Authorization headers, raw DB rows, raw employee answer text,
  full content, raw prompt/model payloads, provider payloads, or plaintext `redeem_code`.
- Do not run local seed or any DB operation beyond existing scoped local validation unless an explicit capability gate
  and task-level approval both permit it.
- Stop instead of expanding into schema, migration, dependency, provider, deploy, payment, OCR, export, or Cost
  Calibration Gate work.
- Cost Calibration Gate remains blocked.
