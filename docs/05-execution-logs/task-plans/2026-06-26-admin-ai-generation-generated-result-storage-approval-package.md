# Task Plan: Admin AI Generation Generated Result Storage Approval Package

Task id: `admin-ai-generation-generated-result-storage-approval-package-2026-06-26`

Branch: `codex/admin-ai-generated-result-storage-approval-20260626`

## Scope

Create a docs/state-only approval package for backend admin AI generation generated result storage.

This task decides the storage boundary and the next allowed implementation package. It does not implement storage,
change schema, run migration, connect to the database, execute routes, call a Provider, or write formal `question` or
`paper` records.

## Read Governance

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-execution.md`

## Decision Work

1. Compare the existing `ai_generation_task`, `admin_ai_generation_task_metadata`, and `personal_ai_generation_result`
   boundaries.
2. Decide whether backend admin generated results should expand an existing table or use an isolated companion table.
3. Define the redacted content, preview, digest, citation, status, audit, and formal-adoption boundaries.
4. Define what a future source TDD task may do and what still requires separate approval.
5. Update `project-state.yaml`, `task-queue.yaml`, evidence, and audit review.

## Expected Decision

Approve a future source TDD task for an isolated backend admin generated result table and adapter, using fake normalized
result fixtures only.

The current Provider-disabled local-contract flow must continue returning `resultPublicId: null`, `summary_only`, and
formal write blocked states until a future runtime produces a validated generated result artifact.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-generated-result-storage-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-generated-result-storage-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-storage-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-generated-result-storage-approval-package.md`

## Explicit Blocks

- Source/test/schema/migration/package/lockfile/script/env changes in this task.
- DB connection, DB write, direct SQL, migration execution, seed, account mutation, or route smoke in this task.
- Provider/model calls, Provider configuration, env/secret reads, or Cost Calibration.
- Raw prompt, raw generated output, raw Provider payload, API key, token, cookie, Authorization header, database URL,
  public identifier list, raw DB row, or unpublished generated content in evidence.
- Formal `question` or `paper` write/adoption.
- Browser/dev-server/e2e, staging/prod, payment, external service, deployment, release readiness, or final Pass.

## Validation

- Scoped Prettier write/check on changed docs/state files.
- `git diff --check`.
- Module Run v2 pre-commit hardening for this task id.
- Module Run v2 pre-push readiness with remote-ahead skip.

Cost Calibration Gate remains blocked.
