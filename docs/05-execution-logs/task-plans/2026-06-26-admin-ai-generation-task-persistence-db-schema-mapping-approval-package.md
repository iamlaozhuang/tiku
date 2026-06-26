# Task Plan: Admin AI Generation Task Persistence DB Schema Mapping Approval Package

Task id: `admin-ai-generation-task-persistence-db-schema-mapping-approval-package-2026-06-26`

Branch: `codex/admin-ai-db-mapping-approval-20260626`

Task kind: `docs_only_schema_mapping_approval_package`

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
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

- Advanced AI generation requires discoverable content admin and organization advanced admin AI question/paper entries.
- AI generation must create trackable tasks and redacted operational evidence.
- Generated output must remain outside formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and
  `mistake_book` until a separately governed adoption workflow exists.
- ADR-002 keeps runtime layering as route/service/repository/model and keeps Drizzle schema ownership in
  `src/db/schema/`.
- ADR-006 treats installed AI SDK packages as dependency availability only, not Provider or runtime approval.

## Requirement Mapping

- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`: requires public task id, status, retry count,
  quota summary, redacted failure category, and safe `ai_call_log` linkage.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`: organization admin AI generation
  creates trackable organization-owned tasks and must keep output separate from platform formal content.
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`: content admin generated
  output must land in an isolated review surface and never write formal `question` or `paper` directly.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`: content and
  organization admin AI generation require discoverable entries, redacted evidence, and formal-content separation.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-task-persistence-route-integration-plan-or-db-adapter-decision.md`
- `src/db/schema/ai-rag.ts`
- `src/server/contracts/admin-ai-generation-task-persistence-contract.ts`
- `src/server/repositories/admin-ai-generation-task-persistence-repository.ts`
- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/models/ai-generation-task.ts`
- `src/server/models/ai-generation-task-request.ts`

## Conflict Check

No requirement conflict was found. The implementation gap is schema shape, not product policy. Existing
`ai_generation_task` already models shared lifecycle, but it has personal/RAG-oriented required fields and lacks admin
metadata needed for non-lossy content/organization admin persistence.

## Decision Approach

Compare three storage shapes:

1. extend `ai_generation_task` with all admin metadata;
2. keep `ai_generation_task` as shared lifecycle and add an admin metadata companion table;
3. create a separate backend AI generation task table.

The package will choose the least duplicative non-lossy shape and define what a later schema/adapter task must request
for approval. This task does not grant that approval.

## Allowed Scope

- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.
- Create task plan, approval package, evidence, and audit review under `docs/05-execution-logs/`.
- Static source/schema reads only.

## Blocked Scope

- Source, tests, DB adapter, schema, migration, seed, package/lockfile, and env files.
- DB connection, DB write, account mutation, `drizzle-kit push`, migration generation, or migration execution.
- Provider call, Provider configuration, credential/env read, Cost Calibration, staging/prod, payment, external service,
  deployment, release readiness, PR, force push, or final Pass.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-task-persistence-db-schema-mapping-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-task-persistence-db-schema-mapping-approval-package-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any source/schema/migration/DB write becomes necessary.
- Approval scope expands beyond docs/state.
- Evidence would need secrets, raw prompt, raw output, provider payload, raw DB rows, or full unpublished content.
- Validation fails repeatedly for the same blocker.
