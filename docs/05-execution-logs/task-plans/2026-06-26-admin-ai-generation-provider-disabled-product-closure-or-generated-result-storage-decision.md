# Task Plan: Admin AI Generation Provider Disabled Product Closure Or Generated Result Storage Decision

Task id: `admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision-2026-06-26`

Branch: `codex/admin-ai-provider-disabled-closure-decision-20260626`

Task kind: `docs_only_decision_package`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Requirement Decision Map

- Admin AI generation must create trackable tasks and redacted operational evidence.
- Content admin AI output belongs to the platform content operations review domain until governed adoption.
- Organization admin AI output belongs to the owning `organization` and must not enter platform formal content.
- Provider, env/secret, Cost Calibration, staging/prod, deployment, payment, external service, and formal `question` or
  `paper` writes remain blocked.
- URL-only access fails acceptance; pending/status/history closure must be visible in the backend workflow.

## Requirement Mapping

- `adminAiGeneration`: decide the provider-disabled product closure before any real Provider smoke.
- `aiGenerationTask`: use existing `ai_generation_task` plus `admin_ai_generation_task_metadata` for metadata-only
  pending/status/history.
- `formalContentBoundary`: do not write formal `question` or `paper` and do not create adoption affordances here.
- `generatedResultStorage`: defer until a separate approval package decides result source, schema/storage, redaction,
  retention, and adoption boundaries.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-task-persistence-db-schema-and-adapter-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-route-db-adapter-integration-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-migration-execution-and-route-smoke.md`
- Static source reads of current admin AI route, contract, DB adapter, and page entry files.

## Conflict Check

No requirement conflict found. The current implementation can persist pending admin AI tasks, but it does not have a
generated-result content store or backend history UI. Requirement SSOT allows trackable tasks and redacted evidence while
formal content writes remain blocked.

## Decision Approach

1. Separate Provider-disabled product closure from generated-result storage.
2. Prefer a metadata-only task/status/history loop while Provider is blocked.
3. Keep `resultPublicId: null`, `contentVisibility: summary_only`, `evidenceStatus: none`, and formal write statuses
   blocked while no real generated result exists.
4. Define the next source task as backend task history/status UI and read-model TDD, not Provider smoke.
5. Define generated-result storage as a later approval package because it may require schema/storage, redaction,
   retention, adoption, and Provider output policy decisions.

## Allowed Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md`

## Blocked Scope

- Source, tests, DB schema, migration, Drizzle snapshot, package, lockfile, seed, and env files.
- DB connection, DB write, migration execution, and `drizzle-kit push`.
- Provider calls, Provider configuration, credential or env/secret reads, raw prompt, raw output, raw provider payload,
  and Cost Calibration.
- Browser/dev-server/e2e, staging/prod, deployment, payment, external service, release readiness, and final Pass.
- Formal `question` or `paper` writes or adoption.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any need to edit source/test/schema/migration/package/lockfile/env files.
- Any need to run DB, Provider, browser, staging/prod, deployment, payment, or external-service commands.
- Any need to store generated result content or decide formal adoption beyond the docs-only boundary.
