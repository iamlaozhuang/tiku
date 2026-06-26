# Task Plan: Admin AI Generation Local DB Read History Route Smoke Approval Package

Task id: `admin-ai-generation-local-db-read-history-route-smoke-approval-package-2026-06-26`

Branch: `codex/admin-ai-db-read-history-smoke-approval-20260626`

Task kind: `docs_only_approval_package`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-project-governance.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-agentic-development-governance.md`
- `docs/02-architecture/adr/adr-005-agent-system-architecture.md`
- `docs/02-architecture/adr/adr-006-ai-sdk-provider-baseline.md`
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

## Requirement Decision Map

- AI task domain requires trackable task status/history without exposing raw prompt, provider payload, secret, token, or
  raw AI output.
- Organization AI generation requires organization advanced admin task tracking and redacted evidence while standard
  organization admin remains denied or unavailable.
- Content admin AI generation must remain an isolated draft/review capability and cannot directly write formal
  `question` or `paper`.
- Formal content separation keeps generated AI content out of formal `question`, `paper`, `practice`, `mock_exam`,
  `exam_report`, and `mistake_book` unless a later governed adoption path is explicitly approved.
- Provider, env/secret, Cost Calibration, staging/prod, payment, external service, deployment, release readiness, and
  final Pass remain separate blocked gates.

## Requirement Mapping

This task prepares a docs/state approval package for a future local DB read-only history route smoke. It maps to the
metadata-only history/status closure that was implemented in
`admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd-2026-06-26`.

The future smoke may prove only that the existing content and organization GET history routes can read redacted metadata
from the local dev DB through the existing route/service/repository boundary. It must not prove generated result
storage, Provider readiness, formal content writes, staging/prod readiness, release readiness, or final acceptance Pass.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-route-db-adapter-integration-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-migration-execution-and-route-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md`

## Conflict Check

No conflict found. The requirement SSOT allows redacted task status/history and requires formal content separation. The
latest evidence shows local DB write-route smoke and metadata-only UI/history implementation are complete, while live DB
GET history route smoke remains unexecuted. This package authorizes only that narrow read route smoke as a later task.

## Allowed Scope

- Create the task plan, approval package, evidence, and audit review.
- Update `project-state.yaml` and `task-queue.yaml`.
- Define a future local-only read route smoke boundary:
  - `GET /api/v1/content-ai-generation-requests` once.
  - `GET /api/v1/organization-ai-generation-requests` once.
  - Maximum total GET route smoke requests: `2`.
  - Local dev DB read through route/service/repository only.
  - Redacted metadata evidence only.

## Blocked Scope

- Execute the GET smoke in this task.
- Run local DB commands, direct SQL, migration, seed, write, or account mutation.
- Start dev server, browser, or e2e runtime.
- Read or record credentials, `.env*`, cookies, tokens, Authorization headers, database URLs, or private account files.
- Modify source, tests, DB schema, migrations, package files, lockfiles, scripts, or env files.
- Implement generated result storage.
- Call Provider, enable Provider configuration, or execute Cost Calibration.
- Write formal `question` or `paper`, or approve adoption.
- Touch staging/prod, payment, external service, deployment, release readiness, PR, or force push.
- Claim staging/prod/release/final Pass.

## Documentation Approach

1. Register the approval package as a closed docs/state task.
2. Define the future execution envelope and redaction rules.
3. Make failure branches explicit so the future smoke stops instead of expanding scope.
4. Preserve sequencing: read history route smoke first, then generated result storage approval package, then Provider/Cost
   smoke only after product closure is clear.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-approval-package.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-approval-package.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-approval-package.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-approval-package.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-local-db-read-history-route-smoke-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-local-db-read-history-route-smoke-approval-package-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Any need to execute a DB connection, migration, seed, write, direct SQL, or route smoke in this task.
- Any need to read credentials, `.env*`, cookies, tokens, Authorization headers, database URLs, or private account files.
- Any need to alter source, tests, schema, migration, package, lockfile, script, or env files.
- Any need to approve generated result storage, Provider/Cost smoke, formal `question`/`paper` adoption, staging/prod,
  payment, external service, deployment, or final Pass.
