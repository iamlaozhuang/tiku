# Organization Training Draft Source Context Schema Migration Plan

## Task

- taskId: `organization-training-draft-source-context-schema-migration`
- executionProfile: `schema_isolated`
- branch: `codex/organization-training-draft-source-context-schema-migration`
- approval: current user prompt on 2026-06-17, `批准执行`, treated as fresh approval to claim this queued schema task only.
- closeout: local commit requires fresh approval after validation; fast-forward merge and push are not approved by this task.
- Cost Calibration Gate remains blocked.

## Required References Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-draft-source-context-schema-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-organization-training-draft-source-context-schema-approval-package.md`
- `src/server/services/organization-training-service.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/db/schema/auth.ts`
- `src/db/schema/organization-training.ts`
- `src/db/schema/organization-training.test.ts`

## Scope

Add an additive, metadata-only schema surface for:

- `organization_training_draft`
- `organization_training_source_context`

Allowed implementation files are limited to:

- `src/db/schema/organization-training.ts`
- `src/db/schema/organization-training.test.ts`
- generated `drizzle/**` migration files
- task plan, evidence, audit, coverage matrix, project-state, and task-queue updates

## Non-Goals

- No repository, service, route, mapper, validator, UI, or e2e implementation.
- No database connection, `drizzle-kit migrate`, `drizzle-kit push`, or runtime migration execution.
- No `.env*`, package, lockfile, dependency, provider/model, staging/prod/cloud/deploy/payment/external-service, PR,
  force-push, or Cost Calibration Gate work.
- No raw question body, standard answer, analysis, raw answer, raw prompt, provider payload, row data, private data,
  public identifier inventory, screenshot, trace, or DOM dump in evidence.

## Implementation Approach

1. Run the local `schemaMigration` capability gate before any schema/test/migration edit.
2. RED: add focused schema tests asserting the two new tables, metadata-only columns, required indexes, named foreign
   keys, and PostgreSQL identifier length limits.
3. GREEN: add Drizzle schema definitions and generated migration SQL with additive-only `CREATE TYPE`, `CREATE TABLE`,
   `ALTER TABLE ... ADD CONSTRAINT`, and `CREATE INDEX` statements.
4. Preserve existing version and answer tables; do not add a version-to-draft foreign key in this first additive slice.
5. Validate with the task-declared commands and record outputs in evidence.

## Risk Controls

- Keep formal `paper`, `mock_exam`, `practice`, `answer_record`, `exam_report`, and `mistake_book` side effects out of
  this schema.
- Store source context as metadata only. The `formal_usage_policy` JSONB column is limited to false-valued policy flags.
- Use project naming conventions: snake*case tables/columns, `idx*`/`udx\_` indexes, named foreign keys under 63 chars.
- Keep the work in a short-lived `codex/` branch and stop before local commit unless post-validation approval is given.
