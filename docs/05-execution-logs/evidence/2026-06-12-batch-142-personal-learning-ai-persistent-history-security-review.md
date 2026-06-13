# Evidence: batch-142-personal-learning-ai-persistent-history-security-review

result: pass

## Batch 142

- Task: `batch-142-personal-learning-ai-persistent-history-security-review`
- Branch: `codex/batch-142-personal-learning-ai-persistent-history-security-review`
- Task kind: `security_review`
- Baseline: `e5e1f1fb2fd41394a3a3a142a309b7bd64f2343c`
- Commit: `e5e1f1fb2fd41394a3a3a142a309b7bd64f2343c` is the verified pre-edit repository baseline. The final immutable
  task commit SHA is reported in closeout because this evidence file participates in the task commit object.
- localFullLoopGate: L0 security-review docs-only.
- threadRolloverGate: not required; task stayed within current thread.
- nextModuleRunCandidate: `batch-143-personal-learning-ai-local-role-flow-persistent-history-validation`.

## Approval Boundary

- Batch-141 dependency was closed, merged, pushed, and branch-cleaned before batch-142 was claimed.
- Scope stayed within the batch-142 allowed files: project state, task queue, task plan, evidence, and audit.
- `codex-security:security-diff-scan` was considered, but its full artifact workflow is blocked for this task because
  scan artifacts/HTML reports are outside batch-142 allowedFiles. This review therefore followed the queue-declared
  L0 docs-only security review surface.
- No product source, tests, e2e, schema/drizzle, package/lockfile, env/secret, provider, deploy, payment, external-service,
  destructive DB, formal generated-content write path, PR, force-push, or Cost Calibration Gate action was approved or
  performed.
- Cost Calibration Gate remains blocked.

## Review Scope

- Read-only reviewed `ai_generation_task` schema and migration, request history contract/model/validator/mapper,
  persistent request repository, route service, app route adapter, student UI integration, focused route/repository/UI
  tests, existing local e2e spec, and batch-137 through batch-141 evidence/audit.
- Reviewed `git diff --name-only 70d5fa65042349bbd483617fa046e7e81729e260^..HEAD`; changed source surfaces are limited
  to personal AI request persistence/history files plus governance docs.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` write-path files appear in
  the batch-137 through batch-141 changed-file set.

## RED:

- Not applicable as a docs-only security review; no implementation test was intentionally made to fail in batch-142.
- Review worklist still checked the risk cases named by the queue: session ownership, public ids only, `ai_call_log`
  redaction, blocked raw content paths, and Cost Calibration Gate remains blocked.

## GREEN:

- session ownership: GET ignores client query ids and calls `listRequestHistory` with `ownerPublicId` from the resolved
  session. POST normalizes `userPublicId`, `actorPublicId`, `ownerPublicId`, and `quotaOwnerPublicId` from session context
  before persistence.
- public ids only: history DTOs expose `requestPublicId`, `taskPublicId`, `resultPublicId`, `aiCallLogPublicId`,
  `requestedAt`, status/evidence/citation metadata, and fixed `redactionStatus`; mapper output does not include internal
  numeric `id`, `owner_public_id`, or idempotency key fields.
- `ai_call_log`: history surfaces expose only nullable `aiCallLogPublicId`; raw prompts, raw generated content,
  provider request/response payloads, request/response snapshots, token counts, model config ids, and internal
  `ai_call_log.id` are not included in the request history DTO.
- Error handling: GET repository failures return standard envelope `{ code: 500017, message, data: null }` without stack
  or connection detail strings. POST persistence failures fall back to the local contract response without leaking
  internal error strings.
- UI/e2e coverage checks no internal `id` keys, no `[data-id]`, no session token, no provider payload, no raw prompt, no
  raw answer, and no generated content in visible output or response payloads.

## Security Decision

- No blocking finding for the current local-contract-only persistence/history surface.
- Residual risk for future tasks: local-browser POST persistence currently accepts public `resultPublicId`,
  `aiCallLogPublicId`, evidence status, citation count, and authorization flag metadata from the request body after
  session ownership normalization. That is acceptable only while provider execution, formal generated-content persistence,
  and Cost Calibration Gate remain blocked. Before any real provider/generated-content path is enabled, those result and
  `ai_call_log` references must become server-owned outputs rather than client-provided metadata.
- Residual risk for future tasks: the schema stores public context ids for `question`, `answer_record`, `paper`, and
  `mock_exam`; later provider/content tasks must re-check authorization and ownership against authoritative domain tables
  before using those ids to read or write generated content.

## Validation Log

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`:
  passed before edits on `codex/batch-142-personal-learning-ai-persistent-history-security-review`; baseline `master` and
  `origin/master` were `e5e1f1fb2fd41394a3a3a142a309b7bd64f2343c`.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:unit`: passed with `Test Files 247 passed (247)` and `Tests 902 passed (902)`.
- `npm.cmd run build`: passed; Next.js compiled successfully and generated `55` static pages.
- `git diff --check`: passed.
- `Select-String -Path docs/05-execution-logs/evidence/2026-06-12-batch-142-personal-learning-ai-persistent-history-security-review.md,docs/05-execution-logs/audits-reviews/2026-06-12-batch-142-personal-learning-ai-persistent-history-security-review.md -Pattern 'session ownership','public ids only','ai_call_log','Cost Calibration Gate remains blocked'`:
  passed; required anchors were present in evidence and audit.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-142-personal-learning-ai-persistent-history-security-review`:
  passed; scope scan covered only the 5 batch-142 allowed governance files.
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-142-personal-learning-ai-persistent-history-security-review`:
  passed; evidence/audit anchors, RED/GREEN evidence, localFullLoopGate, blocked remainder, threadRolloverGate, and
  nextModuleRunCandidate were accepted.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-142-personal-learning-ai-persistent-history-security-review`:
  passed on the short branch with `master`, `origin/master`, and state SHAs all at
  `e5e1f1fb2fd41394a3a3a142a309b7bd64f2343c`.

## Blocked Remainder

- Local role-flow persistent history validation remains batch-143.
- Generated-content domain blocked gate and provider/env/cost blocked gate remain batch-144 and batch-145 after
  dependencies close.
- Provider execution, generated-content persistence, schema/migration work, product source edits, tests/e2e edits,
  dependency/package/lockfile changes, env/secret work, deploy/payment/external-service work, PR, force-push, and
  authorization model changes remain blocked.
- Cost Calibration Gate remains blocked.
