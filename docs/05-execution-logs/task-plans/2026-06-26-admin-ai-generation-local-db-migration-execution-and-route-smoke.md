# Task Plan: Admin AI Generation Local DB Migration Execution And Route Smoke

Task id: `admin-ai-generation-local-db-migration-execution-and-route-smoke-2026-06-26`

Branch: `codex/admin-ai-db-migration-route-smoke-20260626`

Task kind: `local_db_migration_execution_and_route_smoke`

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

## Requirement Decision Map

- ADR-002 requires route handlers to remain thin adapters over service and repository boundaries. The smoke uses the
  existing route handler and default Postgres persistence adapter without source edits.
- ADR-004 limits this run to local `dev`; staging and prod are forbidden.
- ADR-006 approves Drizzle as the current ORM/migration baseline but does not approve `drizzle-kit push`.
- ADR-007 keeps authorization facts service-owned. The smoke uses an injected session object and does not create or
  mutate account, `authorization`, `personal_auth`, `org_auth`, or `redeem_code` data.
- Advanced AI task requirements require trackable task status and redacted evidence without prompt, provider payload,
  secret, token, or raw output.
- Formal content separation requires generated/admin AI task persistence to remain separate from formal `question` and
  `paper` records.

## Requirement Mapping

- AI task domain: apply the reviewed migration and verify local route persistence can create or reuse a trackable
  `pending` task.
- Content admin AI generation: one local content workflow smoke validates the content route-to-DB-adapter path.
- Organization admin AI generation: one local organization workflow smoke validates the organization route-to-DB-adapter
  path.
- Formal content separation: no formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`
  writes are allowed.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-local-db-migration-execution-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-task-persistence-db-schema-and-adapter-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-route-db-adapter-integration-tdd.md`
- `drizzle/20260626134500_add_admin_ai_generation_task_metadata.sql`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/repositories/admin-ai-generation-task-persistence-db-adapter.ts`

## Conflict Check

No conflict found. The approval package conditionally approves this exact local execution after a fresh execution
instruction, which the owner provided in this turn.

## Allowed Scope

- Run the local schema migration capability gate.
- Apply the reviewed local migration through the reviewed migration workflow.
- Run at most two local direct route handler smoke requests with injected sessions:
  - `content/question`;
  - `organization/paper`.
- Permit only the rows created or reused by the route persistence path in `ai_generation_task` and
  `admin_ai_generation_task_metadata`.
- Record redacted evidence and audit review.
- Update `project-state.yaml` and `task-queue.yaml`.

## Blocked Scope

- Do not open, read, edit, print, or record `.env*`, database URLs, credentials, tokens, cookies, or Authorization
  headers.
- Do not run `drizzle-kit push`.
- Do not modify source, tests, schema, migration files, seed files, scripts, package files, or lockfiles.
- Do not start a dev server, browser, or e2e.
- Do not call Provider/model services or execute Cost Calibration.
- Do not write formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, `audit_log`, or
  `ai_call_log`.
- Do not run destructive local DB cleanup or rollback without separate approval.
- Do not touch staging/prod, cloud, deployment, payment, or external services.
- Do not claim release readiness or final Pass.

## Execution Plan

1. Run `Test-ModuleRunV2LocalCapabilityGate.ps1` with `schemaMigration` / `use_capability`.
2. Run the reviewed migration command against local `dev`. If local DB configuration is missing or an error would expose
   secret material, stop and record a minimal diagnostic.
3. Run a stdin-only `tsx` harness that imports the existing route handler, injects fake session services, and uses the
   default Postgres adapter.
4. Record only redacted route/workflow/status summaries.
5. Run scoped formatting and closeout gates.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId admin-ai-generation-local-db-migration-execution-and-route-smoke-2026-06-26 -Capability schemaMigration -Intent use_capability`
- `npx.cmd drizzle-kit migrate`
- `node_modules\.bin\tsx.cmd - < redacted inline route smoke harness`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-local-db-migration-execution-and-route-smoke.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-migration-execution-and-route-smoke.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-local-db-migration-execution-and-route-smoke.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-local-db-migration-execution-and-route-smoke.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-migration-execution-and-route-smoke.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-local-db-migration-execution-and-route-smoke.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-local-db-migration-execution-and-route-smoke-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-local-db-migration-execution-and-route-smoke-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Local DB configuration is missing.
- Migration fails or suggests drift outside the reviewed migration.
- Route smoke requires real login, browser/dev-server/e2e, account mutation, Provider execution, or formal content
  writes.
- Any command output would require recording protected material.
- Validation fails three times for the same blocker.
