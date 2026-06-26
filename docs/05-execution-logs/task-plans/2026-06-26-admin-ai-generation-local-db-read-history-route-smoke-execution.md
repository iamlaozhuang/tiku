# Task Plan: Admin AI Generation Local DB Read History Route Smoke Execution

Task id: `admin-ai-generation-local-db-read-history-route-smoke-execution-2026-06-26`

Branch: `codex/admin-ai-db-read-history-smoke-exec-20260626`

Task kind: `local_db_read_route_smoke`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
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

- AI task domain allows status/history inspection without exposing raw prompt, Provider payload, secret, token, or raw
  AI output.
- Content admin AI generation remains isolated review/draft-oriented and must not write formal `question` or `paper`.
- Organization admin AI generation belongs to an `organization` and must expose trackable AI tasks to advanced
  organization admins without revealing raw generated content.
- Formal content separation remains mandatory.
- Provider, env/secret, Cost Calibration, staging/prod, payment, external service, deployment, release readiness, and
  final Pass remain separately blocked.

## Requirement Mapping

This execution consumes
`docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-approval-package.md`.

It may prove only:

- `GET /api/v1/content-ai-generation-requests` can read redacted history metadata from the local dev DB through the
  route/service/repository path.
- `GET /api/v1/organization-ai-generation-requests` can read redacted history metadata from the local dev DB through
  the same path.

It must not prove generated result storage, Provider readiness, formal content adoption, staging/prod readiness, release
readiness, or final acceptance Pass.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-migration-execution-and-route-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-route-db-adapter-integration-tdd.md`

## Conflict Check

No conflict found. The approval package explicitly permits a follow-up local-only read route smoke capped at two GET
requests. Requirement SSOT requires redacted task metadata and formal content separation.

## Execution Approach

- Use direct route handlers from `createAdminAiGenerationLocalContractRouteHandlers(...)`.
- Inject a redacted local session service instead of reading cookies, tokens, Authorization headers, or private account
  files.
- Use the default Postgres admin AI generation task persistence adapter so the route exercises the local DB read path.
- Do not print raw API bodies. The harness prints only route, status, count, and metadata categories allowed by the
  approval package.
- Execute exactly two GET route calls:
  - content history once;
  - organization history once.

## Allowed Scope

- Local dev DB read through existing route/service/repository code.
- Maximum two GET collection route smoke requests.
- Redacted evidence updates.
- `project-state.yaml` and `task-queue.yaml` updates.

## Blocked Scope

- POST/PATCH/DELETE route calls.
- Direct SQL, raw DB row dumps, migration, seed, write, account mutation, or destructive DB operation.
- Reading or recording `.env*`, cookies, tokens, Authorization headers, database URLs, passwords, private account files,
  localStorage/sessionStorage, or raw session payloads.
- Source, test, schema, migration, package, lockfile, script, or env file changes.
- Generated result storage implementation or approval beyond the next recommendation.
- Provider/model call, Provider configuration, or Cost Calibration.
- Formal `question`/`paper` write or adoption.
- Browser/dev-server/e2e runtime.
- Staging/prod/cloud/deploy, payment, external-service work, PR, force push, release readiness, or final Pass.

## Validation Commands

- `node_modules\.bin\tsx.cmd - < redacted inline direct route GET history smoke harness`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-execution.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-execution.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-execution.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-execution.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-local-db-read-history-route-smoke-execution-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-local-db-read-history-route-smoke-execution-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- A third GET request would be needed.
- Any write/migration/seed/direct SQL/account mutation becomes necessary.
- Any evidence would need raw response body, raw DB rows, prompt, generated output, Provider payload, credential, token,
  cookie, Authorization header, database URL, private account content, public identifier list, or internal numeric id.
- Provider, Cost Calibration, generated result storage, formal content adoption, browser/e2e, staging/prod, payment,
  external-service, deploy, release, or final Pass work becomes necessary.
