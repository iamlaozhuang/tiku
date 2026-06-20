# Task Plan: organization-training-route-runtime-contract-repair

## Task

- Task id: `organization-training-route-runtime-contract-repair`
- Branch: `codex/organization-training-route-runtime-repair`
- Source blocked task: `organization-training-entry-route-path-contract-repair`
- Goal: repair the current organization-training route/manual-draft runtime contract exposed by the existing local
  full-flow spec, without schema/drizzle/migration or dependency changes.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- all ADRs under `docs/02-architecture/adr/`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/05-execution-logs/evidence/2026-06-18-organization-training-entry-route-path-contract-repair.md`

## Allowed Files

- Route/UI: `src/app/(admin)/content/organization-training/page.tsx`,
  `src/app/(admin)/organization-training/page.tsx`, `src/app/api/v1/organization-trainings/route.ts`
- Runtime: `src/server/services/organization-training-route.ts`,
  `src/server/services/organization-training-service.ts`, `src/server/repositories/organization-training-repository.ts`
- Tests/e2e: the matching route/service/repository unit tests, admin/employee entry surface unit tests, and
  `e2e/organization-training-local-full-flow.spec.ts`
- Docs/state: this task's queue, project-state, task plan, evidence, and audit files.

## Blocked Files And Gates

- Blocked files: `.env*`, package and lockfiles, `src/db/schema/**`, `drizzle/**`, `scripts/**`, `playwright-report/**`,
  and `test-results/**`.
- Blocked gates: schema/drizzle/migration, database migration execution, destructive local DB writes, provider/model
  calls, env/secret reads or writes, dependency changes, headed/debug browser mode, staging/prod/cloud/deploy/payment/
  external-service, PR, force-push, and Cost Calibration Gate.

## Plan

1. Run project status, next action, seed proposal, and localFullFlow capability gate.
2. Run focused organization-training unit tests and the scoped Playwright list/test to establish the current real
   failure.
3. Prefer no source change if existing implementation already passes the focused contract. If failure remains, repair
   only the smallest route/service/repository/UI/e2e contract surface inside allowedFiles.
4. Run focused unit, scoped e2e, prettier, lint, typecheck, diff check, pre-commit hardening, module closeout readiness,
   and pre-push readiness.
5. Record redacted evidence only. Do not record database URLs, row dumps, secrets, tokens, Authorization headers, raw
   employee answers, full content, raw prompts, raw generated AI content, provider payloads, or public identifier
   inventories.

## Risk Controls

- No schema/drizzle/migration path is allowed in this packet.
- If validation reaches a later blocker outside route/runtime contract, record it and stop instead of expanding scope.
- Cost Calibration Gate remains blocked.
