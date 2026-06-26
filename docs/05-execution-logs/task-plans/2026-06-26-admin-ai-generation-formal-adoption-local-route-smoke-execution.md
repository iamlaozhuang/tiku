# Admin AI generation formal adoption local route smoke execution plan

Task id: `admin-ai-generation-formal-adoption-local-route-smoke-execution-2026-06-26`

Branch: `codex/admin-ai-formal-adoption-route-smoke-exec-20260626`

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
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Requirement Decision Map

- Content admin AI generated output may only become formal platform content through governed review, validation,
  source attribution, reviewer attribution, and audit evidence.
- This task validates only the route-adoption metadata path. It must keep formal `question` and `paper` draft writes
  blocked.
- Organization-scoped generated content remains outside this task and requires a separate organization adoption decision.
- Provider, Cost Calibration, staging/prod, payment, external service, deployment, release readiness, and final Pass
  remain blocked.

## Requirement Mapping

- Formal content separation maps to the content formal adoption route
  `/api/v1/content-ai-generation-results/{publicId}/formal-adoptions`.
- The route smoke must use content admin or super admin session injection through a local route harness.
- Existing local generated result records may be looked up only by sanitized metadata needed to choose a question and
  paper candidate.
- Successful route smoke may create or reuse formal adoption metadata only. It must prove
  `formalTargetWriteStatus = blocked_without_follow_up_task`.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-route-integration-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-route-integration-tdd.md`

## Conflict Check

- Requirements and approval package agree that content admin adoption is governed and must not write formal
  `question` or `paper` drafts in this task.
- The approval package allows local DB access only for sanitized lookup and route-handler smoke. It does not allow seed,
  migration, Provider, env/secret editing, or formal content writes.
- If no eligible local source exists, the task stops as `blocked_no_eligible_content_generated_result` instead of
  manufacturing data.

## Approved Scope

- Execute at most two sanitized eligible-source lookup queries.
- Execute at most two route-handler POST calls:
  - `content_question_formal_adoption`
  - `content_paper_formal_adoption`
- Record only redacted route/workflow, call count, target type, response status, persistence status, formal target write
  status, redaction status, and sanitized failure category.

## Blocked Scope

- No source or test file change.
- No schema, migration, seed, fixture creation, or migration execution.
- No formal `question` or `paper` draft write.
- No organization-scoped adoption.
- No Provider call, Provider credential read, Provider payload, raw prompt, raw output, or Cost Calibration.
- No staging/prod, payment, external service, deployment, release readiness, final Pass, PR, or force push.

## Execution Approach

1. Use a transient Vitest harness outside the repository.
2. Reuse existing repositories to list content generated result DTOs for `platform_content_review_pool`.
3. Select at most one eligible `question` and one eligible `paper` source from redacted DTO metadata.
4. Invoke `createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers` with a content admin session stub and the real
   local DB adoption adapter.
5. POST the approved review request body for each found source.
6. Delete the transient harness and record only sanitized summaries.

## Stop Conditions

- Local DB connection unavailable: stop with `blocked_local_db_unavailable`.
- No eligible local content generated result: stop with `blocked_no_eligible_content_generated_result`.
- Route returns non-zero response: stop with `blocked_route_smoke_failed`.
- `formalTargetWriteStatus` differs from `blocked_without_follow_up_task`: stop and do not continue.
- Any step requires seed, migration, formal draft adapter, Provider, credentials, staging/prod, or external service work.

## Validation Commands

- Transient Vitest route-handler smoke harness outside repository, max two POST calls.
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-execution.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-execution.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-execution.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-execution.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-adoption-local-route-smoke-execution-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-adoption-local-route-smoke-execution-2026-06-26 -SkipRemoteAheadCheck`
