# Content-admin review batch retry diff history UI local validation

## Task

- Task ID: `content-admin-review-batch-retry-diff-history-ui-local-validation-approval-2026-06-27`
- Branch: `codex/content-admin-review-batch-retry-ui-local-20260627`
- Task kind: `ui_implementation_local_validation`
- Approval source: current user fresh approval on 2026-06-27 for the five-task content-admin review batch/retry/diff/history serial package.

## Dependency Check

- `content-admin-review-batch-selection-source-contract-tdd-approval-2026-06-27`: closed.
- `content-admin-review-failed-retry-source-contract-tdd-approval-2026-06-27`: closed.
- `content-admin-review-result-diff-read-model-source-tdd-approval-2026-06-27`: closed.
- `content-admin-review-adoption-history-read-model-source-tdd-approval-2026-06-27`: closed.

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
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`

## Requirement Decision Map

- Local UI validation may display the four completed source contract states in the existing content-admin review surface.
- UI must remain metadata-only and must not start browser/dev server/e2e, trigger mutation, publish, Provider calls, or student-visible runtime.
- Existing generated result public IDs remain hidden from visible text.

## Boundary

Allowed:

- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md`

Blocked:

- `.env*`, `package.json`, lockfiles, `src/db/schema/**`, `drizzle/**`, migrations, seeds
- DB connection, DB read/write, migration, seed
- Provider call, Provider credential read, Provider payload access, Cost Calibration
- Raw prompt/output/provider payload exposure
- Retry mutation, batch adoption mutation, history mutation
- Formal publish, student-visible runtime
- Browser, e2e, dev server
- Staging/prod/cloud/deploy/payment/external service
- PR, force push, release readiness, final Pass

## TDD Plan

1. RED: add a component/unit test expecting the content-admin traceability panel to render batch selection, failed retry, result diff, and adoption history local validation states without enabling mutation buttons or additional fetches.
2. GREEN: extend the existing traceability panel with a metadata-only local validation summary.
3. Verify redaction: visible text must not include public IDs or protected raw/payload terms.
4. Run focused component/unit tests, scoped Prettier write/check, `git diff --check`, lint, typecheck, and Module Run v2 gates.

## Risk Defenses

- No new route, hook, fetch call, Provider call, DB access, mutation, publish, browser/e2e, or dev server.
- UI state is static metadata tied to completed source-contract status.
- Disabled actions remain visible only as blocked affordances.
- Evidence records command summaries only.

## Validation Commands

- `npm.cmd exec vitest -- run tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npx.cmd prettier --write --ignore-unknown src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/admin-ai-generation-entry-surface.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md`
- `npx.cmd prettier --check --ignore-unknown src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/admin-ai-generation-entry-surface.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-batch-retry-diff-history-ui-local-validation-approval-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-batch-retry-diff-history-ui-local-validation-approval-2026-06-27 -SkipRemoteAheadCheck`
