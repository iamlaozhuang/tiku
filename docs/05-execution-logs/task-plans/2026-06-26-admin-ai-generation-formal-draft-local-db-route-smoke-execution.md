# Admin AI generation formal draft local DB route smoke execution plan

Task id: `admin-ai-generation-formal-draft-local-db-route-smoke-execution-2026-06-26`

Branch: `codex/admin-ai-formal-draft-local-db-smoke-20260626`

Task kind: `local_route_smoke_execution`

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
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-and-metadata-tdd.md`

## Requirement Decision Map

- Content admin generated result adoption must remain governed by review confirmation, platform content scope, and
  redacted evidence.
- This task consumes the approved later local route smoke boundary from the formal draft route integration approval
  package.
- The route may create local formal `question` or `paper` draft records only through the content admin formal adoption
  route and only for existing eligible local generated results.
- Provider/Cost, organization-scoped adoption, publishing, staging/prod, payment, external service, release readiness,
  and final Pass remain separate approval gates.

## Approved Scope

- Use existing local dev DB state only.
- Execute at most two sanitized eligible-source lookups.
- Execute at most two content admin route-handler POST calls:
  - one content `question` formal draft adoption if an eligible source exists;
  - one content `paper` formal draft adoption if an eligible source exists.
- Record only redacted route/workflow/status/latency/public-id/count summaries.

## Blocked Scope

- No source or test file change.
- No schema or migration file change.
- No migration execution, seed, fixture creation, or local data setup.
- No paper publishing, paper section/question composition, or student-visible content adoption.
- No organization-scoped adoption.
- No Provider call, Provider credential read, raw prompt, raw output, or Provider payload.
- No env file edit, dependency/package/lockfile change, staging/prod, payment, external service, release readiness,
  final Pass, PR, or force push.

## Execution Approach

1. Use a transient route-handler smoke harness outside the committed repository state.
2. List content generated result draft summaries for `workspace=content`, `ownerType=platform`, and
   `ownerPublicId=platform_content_review_pool` once, then select at most one `question` and one `paper` candidate.
3. Invoke `createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers` with a content admin session stub and default
   local DB adapters.
4. POST reviewer-confirmed approved formal adoption requests with minimal reviewed draft payloads.
5. Assert successful responses are redacted, use `formalTargetWriteStatus = draft_created`, and contain exactly one
   matching formal draft public id for the target type.
6. Stop without manufacturing data if no eligible local source exists.

## Stop Conditions

- Local DB connection unavailable: stop with `blocked_local_db_unavailable`.
- No eligible local content generated result: stop with `blocked_no_eligible_content_generated_result`.
- Route response is not `code=0`: stop with `blocked_route_smoke_failed`.
- Response contains raw prompt/output/body/secret-like fields: stop with `blocked_redaction_failure`.
- `formalTargetWriteStatus` is not `draft_created`: stop with `blocked_formal_draft_not_created`.
- Any step requires seed, migration, Provider, credentials, staging/prod, external service, or paper composition work.

## Validation Commands

- Transient route-handler smoke harness outside committed repository state, max two POST calls and max two sanitized
  eligible-source lookups.
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-execution.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-execution.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-execution.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-execution.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-draft-local-db-route-smoke-execution-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-draft-local-db-route-smoke-execution-2026-06-26 -SkipRemoteAheadCheck`
