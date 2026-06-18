# Organization Training Draft Source Context Schema Approval Package Evidence

## Result

- Task:
  `organization-training-draft-source-context-schema-approval-package`
- result: pass
- Result: `pass_docs_state_schema_approval_package_seeded`
- Branch:
  `codex/organization-training-draft-source-context-schema-approval-package`
- Timestamp: `2026-06-17T21:19:37-07:00`
- Cost Calibration Gate remains blocked.

## Baseline

- `git status --short --branch`: clean
  `codex/organization-training-draft-source-context-schema-approval-package`.
- `git rev-parse HEAD master origin/master`: all
  `5c5e4e55a7061789b0b5f67f30b1da7537427d78`.
- `Get-TikuProjectStatus.ps1` and `Get-TikuNextAction.ps1 -VerboseHistory`
  were run before edits in this task sequence.
- No `.env*`, secrets, tokens, cookies, Authorization headers, DB URLs,
  provider payloads, raw prompts, raw answers, public identifier inventories,
  row data, private data, screenshots, traces, or DOM dumps were read or
  recorded.

## Required References Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-runtime-api-gap-boundary-audit.md`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-version-takedown-runtime-route-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-training-answer-source-schema-migration-planning.md`
- `src/server/services/organization-training-service.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/db/schema/organization-training.ts`
- `src/db/schema/organization-training.test.ts`

## Local Facts

- Current schema contains `organization_training_version` and
  `organization_training_answer`.
- Current schema does not contain a durable `organization_training_draft` table.
- Current schema does not contain a durable
  `organization_training_source_context` table.
- `organization_training_version.draft_public_id` exists, but there is no
  draft table target that can durably represent manual draft creation or
  copy-to-new-draft lineage.
- Service and contract types already model:
  - manual organization training draft creation;
  - metadata-only source context attachment for `paper` and `mock_exam`;
  - copy-to-new-draft from a published organization training version;
  - formal usage policy that forbids creating formal paper, mock exam, raw
    answer, prompt, provider payload, or formal answer-record side effects.
- The current runtime API is publish/takedown oriented. Manual draft, source
  context attachment, and copy-to-new-draft persistence still require a schema
  gate before repository/runtime implementation.

## Schema Approval Package

### Future Table: `organization_training_draft`

Future schema work should add a metadata-only draft table that supports admin
draft creation and copy-to-new-draft without writing formal paper/mock exam
records.

Proposed fields:

- `id`: BIGINT identity primary key.
- `public_id`: external-safe text identifier with unique index.
- `source_task_public_id`: nullable text lineage from the existing draft DTO.
- `source_version_public_id`: nullable text lineage for copy-to-new-draft.
- `organization_id`: BIGINT foreign key to `organization.id`.
- `organization_public_id`: denormalized organization identifier.
- `org_auth_id`: BIGINT foreign key to `org_auth.id`.
- `authorization_source`: text, constrained by service policy to `org_auth`.
- `authorization_public_id`: denormalized authorization identifier.
- `owner_type`: text, default `organization`.
- `owner_public_id`: organization public identifier.
- `quota_owner_type`: text, default `organization`.
- `quota_owner_public_id`: organization public identifier.
- `profession`, `level`, `subject`: content scope.
- `title`, `description`: draft metadata.
- `question_count`, `total_score`, `question_type_summary`: metadata summary.
- `evidence_status`: metadata evidence status.
- `validation_status`: draft validation state.
- `retention_status`: retention visibility state.
- `created_at`, `updated_at`, `expires_at`: lifecycle timestamps.

Proposed constraints and indexes:

- unique index `udx_organization_training_draft_public_id`.
- index `idx_organization_training_draft_organization_id`.
- index `idx_organization_training_draft_org_auth_id`.
- index `idx_organization_training_draft_scope`.
- index `idx_organization_training_draft_retention`.
- named foreign keys to `organization` and `org_auth`.

### Future Table: `organization_training_source_context`

Future schema work should add a metadata-only source context table for source
paper/mock exam references attached to an organization training draft.

Proposed fields:

- `id`: BIGINT identity primary key.
- `public_id`: external-safe text identifier with unique index.
- `organization_training_draft_id`: BIGINT foreign key to the draft table.
- `organization_training_draft_public_id`: denormalized draft identifier.
- `organization_id`: BIGINT foreign key to `organization.id`.
- `organization_public_id`: denormalized organization identifier.
- `org_auth_id`: BIGINT foreign key to `org_auth.id`.
- `authorization_source`: text, constrained by service policy to `org_auth`.
- `authorization_public_id`: denormalized authorization identifier.
- `source_type`: source context type, currently `paper` or `mock_exam`.
- `source_public_id`: source public identifier.
- `title`, `profession`, `level`, `subject`: source metadata.
- `question_count`, `total_score`, `source_status`: source summary metadata.
- `redaction_status`: must remain metadata-only.
- `formal_usage_policy`: JSONB policy containing only false-valued formal
  write/exposure flags from the service contract.
- `created_at`, `updated_at`: lifecycle timestamps.

Proposed constraints and indexes:

- unique index `udx_organization_training_source_context_public_id`.
- unique index
  `udx_organization_training_source_context_draft_source` on draft and source.
- index `idx_organization_training_source_context_draft_id`.
- index `idx_organization_training_source_context_organization_id`.
- index `idx_organization_training_source_context_source`.
- named foreign keys to `organization_training_draft`, `organization`, and
  `org_auth`; identifier names must be checked against the 63-character
  PostgreSQL limit in the future task.

### Relationship To Existing Version Table

The first schema task should avoid destructive changes to
`organization_training_version`. The existing `draft_public_id` can continue to
carry lineage while the new draft table is introduced. Adding a nullable
`organization_training_draft_id` foreign key to the version table is a possible
later hardening step, but it is not required for the first additive schema
surface unless the future task explicitly proves it is safe.

## Future Schema Task Boundary

Seeded follow-up task:

- `organization-training-draft-source-context-schema-migration`

Required before that task can edit schema or generated migrations:

- fresh user approval to claim the schema task;
- `executionProfile: schema_isolated`;
- task-scoped `schemaMigration: approved_migration_plan`;
- passing local schemaMigration capability gate;
- allowedFiles limited to the schema file, focused schema test, generated
  migration files, and task plan/evidence/audit/state updates;
- no database connection or migration execution unless a later prompt
  explicitly approves local dev DB execution and records redacted evidence.

Future validation should include:

- `Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId organization-training-draft-source-context-schema-migration -Capability schemaMigration -Intent use_capability`;
- focused RED/GREEN schema test using
  `npm.cmd run test:unit -- "src/db/schema/organization-training.test.ts"`;
- generated Drizzle migration review, with generated file names recorded;
- `git diff --check`;
- `npm.cmd run lint`;
- `npm.cmd run typecheck`;
- Module Run v2 precommit, closeout, and prepush readiness gates.

## Non-Goals And Blocked Gates

This task does not approve:

- schema/drizzle/migration edits;
- repository, mapper, validator, route, UI, or e2e implementation;
- database connection, migration execution, or row access;
- formal paper/mock exam/answer-record creation from organization training;
- raw question body, standard answer, analysis, raw answer, raw prompt, provider
  payload, row data, private data, screenshots, traces, or DOM dumps in
  evidence;
- package/lockfile/dependency changes;
- dev server, Browser/Playwright runtime, full e2e, staging/prod/cloud/deploy/
  payment/external-service, PR, force push, or Cost Calibration Gate.

## Validation Results

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`:
  pass; reported current task active before closeout update.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`:
  pass; recommended finishing current task closeout before closeout update.
- `npm.cmd run test:e2e -- --list`: pass; listed 28 tests in 11 files without
  running Browser/Playwright runtime validation.
- Initial scoped Prettier check: failed on the three new Markdown files only.
- `npx.cmd prettier --write --ignore-unknown` on the three new Markdown files:
  pass.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-organization-training-draft-source-context-schema-approval-package.md docs/05-execution-logs/evidence/2026-06-17-organization-training-draft-source-context-schema-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-17-organization-training-draft-source-context-schema-approval-package.md`:
  pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `git diff --check`: pass.

## Module Run V2 Closeout Anchors

- Batch range: docs/state-only schema approval package for
  `organization-training-draft-source-context-schema-approval-package`.
- RED: current durable schema lacks `organization_training_draft` and
  `organization_training_source_context`; manual draft, source context
  attachment, and copy-to-new-draft persistence cannot be implemented without a
  schema gate.
- GREEN: approval package, coverage matrix update, project-state update,
  queue-state update, task plan, evidence, audit, and pending schema-isolated
  follow-up were added without source, schema, migration, DB, provider,
  dependency, e2e runtime, external-service, PR, force-push, or Cost Calibration
  Gate work.
- Commit: `5c5e4e55a7061789b0b5f67f30b1da7537427d78` base checkpoint; task
  commit pending after readiness rerun.
- localFullLoopGate: not used; this task is docs/state-only and did not start a
  dev server, Browser/Playwright runtime, or full e2e.
- threadRolloverGate: no thread rollover required; continue from current
  project-state and queue.
- nextModuleRunCandidate:
  `organization-training-draft-source-context-schema-migration`.

## Closeout Readiness

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-draft-source-context-schema-approval-package`:
  pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-draft-source-context-schema-approval-package`:
  pass after adding strict closeout anchors; first run failed because this
  evidence did not yet record strict closeout anchors and closeout command
  records.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-draft-source-context-schema-approval-package`:
  pass.
