# Content-admin review failed retry source contract TDD

## Task

- Task ID: `content-admin-review-failed-retry-source-contract-tdd-approval-2026-06-27`
- Branch: `codex/content-admin-review-failed-retry-contract-20260627`
- Task kind: `source_contract_tdd`
- Approval source: current user fresh approval on 2026-06-27 for the five-task content-admin review batch/retry/diff/history serial package.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

- Failed AI generation tasks may expose safe failure category and retry state.
- Retry request/state contracts must not call Provider, read Provider credentials, mutate retry state, or expose Provider payloads.
- Content admin AI generated content remains outside formal content until governed adoption/publish tasks approve further work.
- This task covers only retry request/state DTOs and pure eligibility mapping.

## Requirement Mapping

- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`: failed tasks expose safe failure category and retry state without sensitive AI input/output.
- `docs/01-requirements/modules/06-admin-ops.md` section 5.5 and `stories/epic-06-admin-ops.md` US-06-15: content admin AI draft/review evidence remains redacted.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`: Provider, prompt, raw output, and formal writes remain gated.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-batch-retry-diff-history-enhancement-package.md`

## Conflict Check

No conflict found. Requirements permit safe retry state visibility, while the current task explicitly keeps real retry execution and Provider work blocked.

## Boundary

Allowed:

- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/services/admin-ai-generation-failed-retry-state-service.ts`
- `src/server/services/admin-ai-generation-failed-retry-state-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md`

Blocked:

- `.env*`, `package.json`, lockfiles, `src/db/schema/**`, `drizzle/**`, migrations, seeds
- DB connection, DB read/write, migration, seed
- Provider call, Provider credential read, Provider payload access, Cost Calibration
- Retry mutation or retry execution
- Batch adoption mutation, formal publish, student-visible runtime
- Browser, e2e, dev server
- Staging/prod/cloud/deploy/payment/external service
- PR, force push, release readiness, final Pass

## TDD Plan

1. RED: add focused unit tests for a failed retry state service. Expected behavior: retryable failed tasks produce `retry_request_available`, non-failed/non-retryable/max-retry tasks produce safe blocked states, and every DTO records Provider/retry mutation as not executed.
2. GREEN: add minimal DTO types to `admin-ai-generation-local-contract.ts` and implement a pure mapping service.
3. Verify redaction: serialized DTOs must not include protected prompt/output/provider artifacts or internal numeric ids.
4. Run focused unit tests, scoped Prettier write/check, `git diff --check`, lint, typecheck, and Module Run v2 gates.

## Risk Defenses

- Pure function only; no repository, DB adapter, route handler, Provider, credential, or mutation path.
- Only public IDs, failure category, retry counters, and redacted state are exposed.
- Retry action remains request-only with `retryMutationStatus: not_executed`.
- Provider boundary is explicit: no Provider call, no credential read, no Provider payload required.

## Validation Commands

- `npm.cmd exec vitest -- run src/server/services/admin-ai-generation-failed-retry-state-service.test.ts`
- `npx.cmd prettier --write --ignore-unknown src/server/contracts/admin-ai-generation-local-contract.ts src/server/services/admin-ai-generation-failed-retry-state-service.ts src/server/services/admin-ai-generation-failed-retry-state-service.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md`
- `npx.cmd prettier --check --ignore-unknown src/server/contracts/admin-ai-generation-local-contract.ts src/server/services/admin-ai-generation-failed-retry-state-service.ts src/server/services/admin-ai-generation-failed-retry-state-service.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-failed-retry-source-contract-tdd-approval-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-failed-retry-source-contract-tdd-approval-2026-06-27 -SkipRemoteAheadCheck`
