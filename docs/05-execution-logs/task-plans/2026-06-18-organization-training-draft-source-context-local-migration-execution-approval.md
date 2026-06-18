# Organization Training Draft Source Context Local Migration Execution Approval Plan

## Task

- taskId: `organization-training-draft-source-context-local-migration-execution-approval`
- executionProfile: `local_migration_execution_plus_scoped_full_flow`
- branch: `codex/organization-training-local-experience-chain`
- status: in progress
- `experience_closed`: not claimed
- Cost Calibration Gate remains blocked.

## Human Approval

- The 2026-06-18 user selected option 1 after being asked to choose between local migration execution and read-only
  persistence readiness.
- Approved action: run `npx.cmd drizzle-kit migrate` against the current local dev database after validating that
  `.env.local` resolves to a local/dev loopback database target.
- Approved follow-up: rerun `npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts`.

## Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-draft-source-context-schema-migration.md`
- `docs/05-execution-logs/evidence/2026-06-18-organization-training-entry-route-path-contract-repair.md`
- `docs/05-execution-logs/evidence/2026-06-18-organization-training-admin-employee-local-full-flow-validation.md`
- `drizzle/20260618063739_add_organization_training_draft_source_context.sql`
- `drizzle.config.ts`

## Scope

- Materialize local-only approval for draft/source-context migration execution.
- Validate that `DATABASE_URL` from `.env.local` targets local/dev loopback before running migration.
- Run reviewed Drizzle migration with `npx.cmd drizzle-kit migrate`.
- Do not run `drizzle-kit push`.
- Rerun the scoped organization-training admin-to-employee local full-flow e2e.
- Update task queue, project-state, coverage matrix, evidence, audit, and the rerun evidence for the prior full-flow
  validation task.

## Non-Scope

- No schema, drizzle SQL, migration file, package, lockfile, dependency, provider/model, staging/prod/cloud/deploy,
  payment, external-service, PR, force-push, or Cost Calibration Gate change.
- No `.env*` modification and no secret/database URL output.
- No product source edits.
- No destructive database operation.
- No `experience_closed` claim unless the rerun and closure evidence support it; closure readiness remains separate.

## Execution Steps

1. Record the approval in queue/state.
2. Run `Test-ModuleRunV2LocalCapabilityGate` for `schemaMigration`.
3. Validate `.env.local` target locally without printing the URL.
4. Run `npx.cmd drizzle-kit migrate`.
5. Rerun the scoped local full-flow e2e.
6. Run focused unit/list/static/readiness gates as applicable.
7. Record evidence and audit, including any remaining blocker.

## Risk Controls

- Evidence must not include Authorization headers, cookies, passwords, database URLs, provider payloads, raw prompts, raw
  answers, raw row data, or public identifier inventories.
- Stop immediately if the database target is not loopback/local dev.
- Stop immediately if migration command attempts `drizzle-kit push` or touches staging/prod/cloud targets.
- If full-flow reveals a new downstream blocker, record it instead of expanding scope.
