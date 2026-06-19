# Local Machine Unit Failure Repair Before Full Phase 1 Task Plan

## Task

- Task id: `local-machine-unit-failure-repair-before-full-phase-1`
- Branch: `codex/local-machine-phase-1-unit-repair-and-rerun`
- Task kind: `implementation_tdd`
- Module Run version: 2
- Date: 2026-06-19
- Goal: repair the two stable unit failures found by the fresh local DB phase 1 rerun, then rerun phase 1 validation.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-local-machine-fresh-db-phase-1-validation-rerun.md`
- `tests/unit/admin-model-config-management-ui.test.ts`
- `tests/unit/phase-9-multi-client-rest-contract-verification.test.ts`
- `src/features/admin/model-config-management/AdminModelConfigManagement.tsx`
- `src/app/api/v1/organization-analytics/employee-statistics/route.ts`

## Scope

- Repair `tests/unit/admin-model-config-management-ui.test.ts` so it asserts the current redaction-safe fallback display contract instead of expecting a raw fallback public id.
- Repair `src/app/api/v1/organization-analytics/employee-statistics/route.ts` so the route exposes a statically identifiable `GET` export consistent with other App Router route files.
- Run targeted RED/GREEN first, then full unit and full phase 1 local validation against fresh disposable local database `tiku_fresh_phase1_unit_repair_202606182324`.
- Record redacted evidence only.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-local-machine-unit-failure-repair-before-full-phase-1.md`
- `docs/05-execution-logs/evidence/2026-06-19-local-machine-unit-failure-repair-before-full-phase-1.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-local-machine-unit-failure-repair-before-full-phase-1.md`
- `tests/unit/admin-model-config-management-ui.test.ts`
- `src/app/api/v1/organization-analytics/employee-statistics/route.ts`

## Blocked Work

- No dependency, package, lockfile, schema, migration, drizzle, script, `.env*`, raw DB row, provider/model, provider configuration, payment, external-service, staging/prod/cloud/deploy, PR, push, force-push, or Cost Calibration Gate work.
- Do not modify unrelated product source, unrelated tests, E2E specs, migrations, seed scripts, or runtime configuration.
- Do not repair the existing `tiku` migration ledger and do not run `drizzle-kit push`.

## TDD Plan

1. RED: rerun the two failing unit files and confirm the same two failures.
2. GREEN repair 1: align the admin model-config UI test with the redaction-safe fallback display and assert the raw fallback identifier is not rendered.
3. GREEN repair 2: replace destructured route export with a direct `export const GET = ...` assignment.
4. Run targeted unit files, full unit, lint, typecheck, full E2E, build, and `git diff --check`.
5. Rerun fresh local DB migrate, dev seed, and validation data prep before full suite commands.
6. Format docs/state files, run mechanism closeout gates, and make one local commit.

## Success Criteria

- The two previously failing unit files pass.
- Full `npm.cmd run test:unit` passes.
- Fresh local DB migration, dev seed, validation data prep, lint, typecheck, full E2E, build, and `git diff --check` pass.
- Mechanism PreCommitHardening and ModuleCloseoutReadiness pass for this task.
- Evidence contains no database URL, secret, token, raw DB row, cleartext `redeem_code`, full paper/material content, raw prompt, raw AI response, provider payload, screenshot, trace, or HTML report.

## Stop Conditions

- A fix requires schema/migration/dependency/env/provider/external service work.
- Full phase 1 rerun fails after the two stable unit failures are fixed.
- Evidence would require recording sensitive values or raw runtime payloads.
