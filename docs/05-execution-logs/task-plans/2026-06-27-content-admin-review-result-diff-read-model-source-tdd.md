# Content-admin review result diff read-model source TDD

## Task

- Task ID: `content-admin-review-result-diff-read-model-source-tdd-approval-2026-06-27`
- Branch: `codex/content-admin-review-result-diff-contract-20260627`
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
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

- Content-admin review may compare a redacted generated result summary with the redacted adopted formal draft summary.
- The read-model must expose only masked previews, digests, field-level change states, public references, evidence metadata, and redaction boundaries.
- The read-model must not expose raw prompt, raw generated output, Provider payload, internal numeric IDs, or mutation/publish paths.

## Boundary

Allowed:

- `src/server/contracts/admin-ai-generation-formal-adoption-contract.ts`
- `src/server/services/admin-ai-generation-review-result-diff-service.ts`
- `src/server/services/admin-ai-generation-review-result-diff-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md`

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

1. RED: add a focused unit test for a redacted result-vs-formal-draft diff read-model service. The test expects masked/digest-only changed/unchanged/missing field states and no protected artifacts.
2. GREEN: add minimal DTO/source types to the formal adoption contract and implement a pure mapping service.
3. Verify redaction: serialized DTOs must not include protected prompt/output/provider artifacts or internal numeric IDs.
4. Run focused unit tests, scoped Prettier write/check, `git diff --check`, lint, typecheck, and Module Run v2 gates.

## Risk Defenses

- Pure function only; no repository, DB adapter, route handler, Provider, credential, mutation, or publish path.
- Diff values use masked previews and digest comparison only.
- Formal draft references stay public-ID based and read-only.
- Evidence records command summaries only; no raw content or sensitive payloads.

## Validation Commands

- `npm.cmd exec vitest -- run src/server/services/admin-ai-generation-review-result-diff-service.test.ts`
- `npx.cmd prettier --write --ignore-unknown src/server/contracts/admin-ai-generation-formal-adoption-contract.ts src/server/services/admin-ai-generation-review-result-diff-service.ts src/server/services/admin-ai-generation-review-result-diff-service.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md`
- `npx.cmd prettier --check --ignore-unknown src/server/contracts/admin-ai-generation-formal-adoption-contract.ts src/server/services/admin-ai-generation-review-result-diff-service.ts src/server/services/admin-ai-generation-review-result-diff-service.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-result-diff-read-model-source-tdd-approval-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-result-diff-read-model-source-tdd-approval-2026-06-27 -SkipRemoteAheadCheck`
