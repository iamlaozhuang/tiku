# Advanced Organization Analytics Training Answer Source Schema Migration Planning Evidence

## Result

- Task: `advanced-organization-analytics-training-answer-source-schema-migration-planning`
- result: pass
- Result: `pass_docs_only_schema_migration_approval_package_seeded`
- Branch: `codex/advanced-organization-analytics-training-answer-source-schema-migration-planning`
- Timestamp: `2026-06-16T18:47:42-07:00`
- Cost Calibration Gate remains blocked.

## Baseline

- `git switch master`: pass before task claim.
- `git fetch --prune origin`: pass before task claim; Git reported a non-blocking loose-object maintenance warning.
- `git status --short --branch`: clean `master...origin/master` before branch creation.
- `git rev-parse HEAD master origin/master`: all `89ebcd06f6ae1f37b4aaea2cfbb6a364e445120f` before branch creation.
- `git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex`: no output before branch creation.

## Required References Read

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
- `docs/04-agent-system/sop/dependency-introduction-gate.md`

## Prior Gap Restatement

The prior readonly decision found that the real organization analytics Postgres gateway needs an official organization training employee submission source. Current schema cannot provide that source:

- `organization_training_version` is publish/version metadata.
- `answer_record` is scoped to `practice` and `mock_exam`.
- The declared repository contract needs official submission summaries keyed to organization training versions and employees.
- Audit logs and generation metadata are not a durable answer/submission source.

This task did not inspect database rows, private data, `.env*`, provider payloads, raw prompts, raw answers, or public identifier lists.

## Migration Approval Package

### Proposed Future Schema Surface

Future schema work should add a metadata-only official submission source, tentatively named `organization_training_answer`, in `src/db/schema/organization-training.ts`.

The table should support organization analytics without storing raw answer content or provider payloads. Proposed fields:

- `id`: BIGINT identity primary key.
- `public_id`: external-safe text identifier with unique index.
- `organization_training_version_id`: BIGINT foreign key to `organization_training_version.id`.
- `organization_training_version_public_id`: denormalized immutable version identifier for service/repository mapping.
- `employee_id`: BIGINT foreign key to `employee.id`.
- `employee_public_id`: denormalized employee identifier for service/repository mapping.
- `organization_id`: BIGINT foreign key to `organization.id`.
- `organization_public_id`: denormalized organization identifier for service/repository mapping.
- `organization_training_answer_status`: enum/status value using the existing organization training answer lifecycle vocabulary: `in_progress`, `submitted`, `read_only`.
- `score`: nullable numeric score; null before official scoring/submission.
- `total_score`: numeric total score for the version attempt.
- `submitted_at`: nullable timestamp; required when status is `submitted` or `read_only`.
- `answer_organization_snapshot`: JSONB organization lineage snapshot captured at submission time.
- `created_at`: timestamp.
- `updated_at`: timestamp.

The table is intentionally summary/metadata oriented. It should not introduce raw answer payload storage for analytics, provider payload storage, raw prompt storage, raw answer storage, row-data evidence, or private data exposure.

### Proposed Constraints And Indexes

- Primary key: `id`.
- Unique index: `udx_organization_training_answer_public_id`.
- Unique index: `udx_organization_training_answer_training_version_employee` on `(organization_training_version_id, employee_id)` if product policy allows one official answer per employee per version.
- Index: `idx_organization_training_answer_training_version_id`.
- Index: `idx_organization_training_answer_employee_id`.
- Index: `idx_organization_training_answer_organization_id_submitted_at`.
- Index: `idx_organization_training_answer_status_submitted_at`.

If future product policy allows multiple attempts, the schema task must first add an explicit `attempt_number` or current-official marker and revise the unique constraint. This planning task does not approve that broader attempt model.

### Proposed Migration Steps

Future approved schema task:

1. Pass a local `schemaMigration` capability gate.
2. Add the enum and table to `src/db/schema/organization-training.ts`.
3. Add focused schema tests for table shape, status vocabulary, constraints, and indexes.
4. Generate a Drizzle migration file with `drizzle-kit generate`.
5. Do not execute database migrations unless the future task explicitly approves local dev migration execution and records redacted evidence.
6. Do not touch package files, lockfiles, provider configuration, runtime services, repository query implementations, routes, UI, e2e, staging, prod, cloud, deploy, payment, or external services.

### Rollback And Recovery

- Before applying to any real database, future migration evidence must record the reviewed migration filename and recovery plan.
- Local dev rollback can drop the new table and enum only if no dependent data exists.
- Staging/prod rollback remains out of scope and requires a separate approved environment plan with backup/restore evidence.

### Future Gateway Boundary

After the schema exists and is validated, a separate repository gateway implementation task can read aggregate-only official submission summaries from the new source. That later task must still avoid row/private data exposure and must not return database rows directly to API contracts.

## Seeded Follow-Up

Seeded pending task:

- `advanced-organization-analytics-training-answer-source-schema-migration`

The follow-up remains blocked until fresh user approval and schema migration capability gates pass.

## Module Run V2 Closeout Anchors

- Batch range: docs-only single-task planning closeout for `advanced-organization-analytics-training-answer-source-schema-migration-planning`.
- RED: existing schema gap from the prior readonly decision remains the failing condition for real Postgres gateway implementation.
- GREEN: docs-only migration approval package and next schema/migration task were seeded without schema, migration, runtime, database, provider, dependency, e2e, or external-service changes.
- Commit: `89ebcd06` base checkpoint; local task commit remains pending post-validation fresh approval.
- localFullLoopGate: local validation commands are recorded below; no browser/e2e/dev-server loop is allowed for this task.
- threadRolloverGate: no new thread required; continue from project state and task queue.
- nextModuleRunCandidate: `advanced-organization-analytics-training-answer-source-schema-migration`.

## Validation Results

Validation was run after writing this evidence and state updates. See the validation section below for exact commands and final status.

- `Select-String -Path docs/04-agent-system/state/task-queue.yaml -Pattern "advanced-organization-analytics-training-answer-source-schema-migration-planning","status: closed","docs_schema_migration_planning"`: pass.
- `git diff --check`: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-training-answer-source-schema-migration-planning`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-training-answer-source-schema-migration-planning`: pass after adding fixed closeout anchors; first run failure is retained as a resolved evidence completeness issue.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-training-answer-source-schema-migration-planning`: pass.

## Blocked Gates Confirmed

- No `.env*` read, output, summary, or modification.
- No source implementation or query implementation.
- No schema, migration, Drizzle, package, lockfile, dependency, script, route, service, repository, UI, or e2e modification.
- No database connection, database row access, provider/model call, provider configuration, staging/prod/cloud/deploy/payment/external-service work, PR, force push, or Cost Calibration Gate.
