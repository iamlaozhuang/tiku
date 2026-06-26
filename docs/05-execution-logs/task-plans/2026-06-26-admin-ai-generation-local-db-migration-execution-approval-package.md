# Task Plan: Admin AI Generation Local DB Migration Execution Approval Package

Task id: `admin-ai-generation-local-db-migration-execution-approval-package-2026-06-26`

Branch: `codex/admin-ai-db-migration-approval-20260626`

Task kind: `docs_only_local_db_migration_execution_approval_package`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- ADR-002 requires route handlers to remain thin adapters over services and repositories. The future route smoke should prove the existing route handler calls the DB persistence adapter without adding business logic to the route.
- ADR-004 and ADR-005 keep `dev`, `staging`, and `prod` isolated. This package can only approve a future local `dev` migration and route smoke; staging/prod remains blocked.
- ADR-006 records Drizzle as the current ORM baseline and keeps provider/env/dependency capabilities gated. The migration execution must use the reviewed Drizzle migration path and must not introduce dependencies.
- ADR-007 keeps authorization source and `effectiveEdition` service-owned. The route smoke must use injected local session context only; it must not create or mutate accounts or authorization records.
- Advanced AI task requirements require trackable AI tasks and redacted task status without prompt, provider payload, secret, token, or raw AI output.
- Organization AI generation and content admin AI decisions require admin AI generation to stay separate from formal `question` and `paper` records until a separate governed adoption path exists.

## Requirement Mapping

- AI task domain: the next execution task may validate that admin AI generation local-contract requests persist trackable `pending` tasks through shared `ai_generation_task`.
- Content admin AI generation: the next execution task may validate platform/content-review task persistence for one content workflow.
- Organization admin AI generation: the next execution task may validate organization-owned task persistence for one organization workflow.
- Formal content separation: both current and future tasks must keep Provider execution and formal `question`/`paper` writes blocked.
- Environment isolation: any execution approved by this package is limited to local `dev` database context only.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-task-persistence-db-schema-mapping-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-task-persistence-db-schema-and-adapter-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-task-persistence-db-schema-and-adapter-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-route-db-adapter-integration-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-route-db-adapter-integration-tdd.md`
- `drizzle/20260626134500_add_admin_ai_generation_task_metadata.sql` as static source review only.
- `src/server/repositories/admin-ai-generation-task-persistence-db-adapter.ts` as static source review only.
- `src/server/services/admin-ai-generation-local-contract-route.ts` as static source review only.

## Conflict Check

No conflict found. The prior schema/adapter task created the migration and DB adapter but explicitly did not execute the local DB migration. The route integration task wired default production route handlers to the Postgres DB adapter but explicitly did not perform live DB validation. This package fills the approval boundary between those tasks and any future local DB execution.

## Allowed Scope

- Create this task plan, approval package, evidence, and audit review.
- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.
- Static-read the prior evidence, the reviewed migration SQL, and the route/adapter source files.

## Blocked Scope

- Do not apply the migration in this task.
- Do not connect to any database in this task.
- Do not run route smoke, browser, dev server, or e2e in this task.
- Do not read, edit, print, or persist `.env*`, database URLs, credentials, tokens, cookies, or Authorization headers.
- Do not modify source, tests, schema, migration, seed, package, lockfile, or scripts.
- Do not call Provider/model services or execute Cost Calibration.
- Do not write formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Do not touch staging/prod, cloud, deployment, payment, or external services.
- Do not claim release readiness or final Pass.

## Decision Approach

Prepare an approval package that answers whether the next task may apply the already reviewed
`admin_ai_generation_task_metadata` migration locally and run a minimal local DB route smoke.

The package must separate:

- current task execution boundary: docs/state only, no DB execution;
- future allowed execution boundary: local `dev` only, reviewed migration only, no `drizzle-kit push`;
- route smoke boundary: direct route handler invocation with injected local session and default Postgres adapter;
- evidence boundary: redacted command/status/schema/public-reference summary only.

## Proposed Future Execution Boundary

If a later fresh execution instruction accepts the package, the next task may:

- run `Test-ModuleRunV2LocalCapabilityGate.ps1` for `schemaMigration` with `Intent use_capability`;
- apply only `drizzle/20260626134500_add_admin_ai_generation_task_metadata.sql` through the reviewed migration workflow, preferably `npx.cmd drizzle-kit migrate`;
- run a minimal local DB route smoke through a temporary outside-repository harness or equivalent local-only route invocation;
- use injected session state for one `content` workflow and one `organization` workflow, with at most two successful route POSTs by default;
- write only local `ai_generation_task` and `admin_ai_generation_task_metadata` rows needed by the smoke;
- record redacted evidence only.

If the future smoke requires account login, real cookies, browser/dev-server/e2e, seed/account mutation, source/test/script changes, or more than two route requests, the task must stop for a separate approval.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-local-db-migration-execution-approval-package.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-local-db-migration-execution-approval-package.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-migration-execution-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-local-db-migration-execution-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-local-db-migration-execution-approval-package.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-local-db-migration-execution-approval-package.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-migration-execution-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-local-db-migration-execution-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-local-db-migration-execution-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-local-db-migration-execution-approval-package-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- The package would need source/schema/migration/test/package/env edits.
- The package would need real DB connection, migration execution, or route smoke now.
- Evidence would need a database URL, credential, token, cookie, Authorization header, raw DB row dump, prompt, provider payload, or raw generated output.
- The future execution plan would require staging/prod/cloud/deploy/payment/external service, Provider/Cost, or formal `question`/`paper` writes.
