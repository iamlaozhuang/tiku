# Task Plan: organization-training-admin-visible-scope-no-migration-repair

## Task

- Task id: `organization-training-admin-visible-scope-no-migration-repair`
- Branch: `codex/organization-training-admin-visible-scope-no-migration-repair`
- Source blocked task: `organization-training-draft-source-context-local-migration-execution-approval`
- Goal: validate or repair the organization-training admin visible-scope blocker without adding schema/drizzle/migration
  files and without running migration execution.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- all ADRs under `docs/02-architecture/adr/`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/05-execution-logs/evidence/2026-06-18-organization-training-draft-source-context-local-migration-execution-approval.md`

## Allowed Files

- `src/db/dev-seed.ts`
- `src/db/dev-seed.test.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `e2e/organization-training-local-full-flow.spec.ts`
- this task's project-state, task-queue, plan, evidence, and audit files.

## Blocked Files And Gates

- Blocked files: `.env*`, package and lockfiles, `src/db/schema/**`, `drizzle/**`, `scripts/**`, `playwright-report/**`,
  and `test-results/**`.
- Blocked gates: schema/drizzle/migration changes, migration execution, destructive local DB writes, provider/model
  calls, env/secret reads or writes, dependency changes, headed/debug browser mode, staging/prod/cloud/deploy/payment/
  external-service, PR, force-push, and Cost Calibration Gate.

## Plan

1. Run project status, next action, seed proposal, and localFullFlow capability gate.
2. Run focused dev-seed/service unit tests, Playwright list, and the scoped organization-training full-flow spec.
3. If current validation passes, do not change source. If it fails on admin visible scope, repair only the smallest
   allowed fixture/service/e2e contract surface without schema or migration work.
4. Run prettier, lint, typecheck, diff check, pre-commit hardening, module closeout readiness, and pre-push readiness.
5. Record redacted command evidence only.

## Risk Controls

- No migration or schema edits are allowed in this packet.
- No migration execution or destructive local DB operation is allowed in this packet.
- If validation reaches a later source-context UI mapping blocker, defer to the next repair packet.
- Cost Calibration Gate remains blocked.
