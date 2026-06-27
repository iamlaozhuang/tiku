# Content-admin review batch selection source contract TDD

## Task

- Task ID: `content-admin-review-batch-selection-source-contract-tdd-approval-2026-06-27`
- Branch: `codex/content-admin-review-batch-selection-contract-20260627`
- Task kind: `source_contract_tdd`
- Approval source: current user fresh approval on 2026-06-27 for the five-task content-admin review batch/retry/diff/history serial package.

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
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

- Content admins must have content AI generation entries that feed a draft/review workflow, not direct formal writes.
- AI generated content must not automatically create or publish formal `question` or `paper` records.
- Content admin formal adoption requires review, validation, reviewer/source attribution, and `audit_log` evidence before formal adoption.
- This task covers only batch candidate selection, validation state, and preview contracts. Batch adoption mutation remains blocked.
- Evidence and DTOs must stay redacted: no raw prompt, raw generated output, raw Provider payload, secret, token, database URL, internal numeric id, or student-visible runtime content.

## Requirement Mapping

- `docs/01-requirements/modules/06-admin-ops.md` section 5.5: content AI draft and review must not directly write formal `question` or `paper`.
- `docs/01-requirements/stories/epic-06-admin-ops.md` US-06-15 AC-2 through AC-4: content AI results enter review, formal adoption needs review/governance, evidence remains redacted.
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`: generated content remains separate from formal content until approved adoption.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`: content admin output may only become formal content through governed review, validation, attribution, and audit.

## Evidence-Only Sources

- `docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-batch-retry-diff-history-enhancement-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-batch-retry-diff-history-enhancement-package.md`
- `docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-single-result-traceability-source-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-single-result-traceability-source-tdd.md`

## Conflict Check

No conflict found. The requirement SSOT allows governed content-admin review/adoption contracts, while this task stays below mutation level by exposing only redacted batch selection and preview state.

## Boundary

Allowed:

- `src/server/contracts/admin-ai-generation-formal-adoption-contract.ts`
- `src/server/services/admin-ai-generation-review-batch-selection-service.ts`
- `src/server/services/admin-ai-generation-review-batch-selection-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md`

Blocked:

- `.env*`, `package.json`, lockfiles, `src/db/schema/**`, `drizzle/**`, migrations, seeds
- DB connection, DB read/write, migration, seed
- Provider call, Provider credential read, Provider payload access, Cost Calibration
- Batch adoption mutation, formal publish, student-visible runtime
- Browser, e2e, dev server
- Staging/prod/cloud/deploy/payment/external service
- PR, force push, release readiness, final Pass

## TDD Plan

1. RED: add focused unit tests for a batch candidate selection preview service. Expected behavior: eligible content/platform draft results are selectable, invalid candidates receive safe blocked reasons, preview state records `batchAdoptionMutationStatus: not_executed`, and serialized DTOs do not leak raw generated/provider fields.
2. GREEN: implement minimal contract DTO types and pure service mapping. No repository DB adapter, route handler, mutation, Provider, or browser work.
3. Refactor only if needed to remove duplication while focused tests remain green.
4. Run focused unit tests, scoped Prettier write/check, `git diff --check`, lint, typecheck, and Module Run v2 gates.

## Risk Defenses

- Keep the implementation pure and fixture-driven.
- Expose only public IDs and redacted summaries already allowed in existing formal adoption contracts.
- Represent every write path as preview-only with `not_executed`.
- Fail closed for non-content workspace, non-platform owner, non-draft status, already unblocked formal adoption, or mismatched target type.
- Do not add dependencies, schema, migrations, runtime routes, browser tests, or Provider execution.

## Validation Commands

- `npm.cmd exec vitest -- run src/server/services/admin-ai-generation-review-batch-selection-service.test.ts`
- `npx.cmd prettier --write --ignore-unknown src/server/contracts/admin-ai-generation-formal-adoption-contract.ts src/server/services/admin-ai-generation-review-batch-selection-service.ts src/server/services/admin-ai-generation-review-batch-selection-service.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md`
- `npx.cmd prettier --check --ignore-unknown src/server/contracts/admin-ai-generation-formal-adoption-contract.ts src/server/services/admin-ai-generation-review-batch-selection-service.ts src/server/services/admin-ai-generation-review-batch-selection-service.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-batch-selection-source-contract-tdd-approval-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-batch-selection-source-contract-tdd-approval-2026-06-27 -SkipRemoteAheadCheck`
