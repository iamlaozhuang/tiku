# Evidence: batch-111-personal-learning-ai-request-context-local-contract

result: pass

## Summary

Implemented the local personal learning AI request-context contract for redacted `paper` and `mock_exam` context
selection. The contract now returns an explicit selected context of `none`, `paper`, or `mock_exam`, preserves the
`personal_auth` boundary for this local request surface, and rejects ambiguous requests that include both `paperPublicId`
and `mockExamPublicId`.

No provider call, provider configuration, env/secret work, schema/migration work, dependency change, e2e, staging/prod,
deploy, payment, external-service work, PR, force push, or Cost Calibration Gate execution was performed.

## Required Anchors

- Batch range: batch-111
- RED: the new focused request context unit test covered missing context, `paper` context, `mock_exam` context,
  ambiguous mixed context rejection, and sensitive payload omission before closeout.
- GREEN: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-context-service.test.ts` passed
  with 1 test file and 5 tests.
- Commit: `4c6669f8c4104d9580c99bf4347043af25ab10f9` accepted pre-closeout baseline; local closeout commit pending
- Task: `batch-111-personal-learning-ai-request-context-local-contract`
- Branch: `codex/batch-111-personal-learning-ai-request-context-local-contract`
- `localFullLoopGate`: L2
- `threadRolloverGate`: no rollover required for this focused local contract task
- `nextModuleRunCandidate`: `batch-112-personal-learning-ai-redacted-result-reference-local-contract`
- Cost Calibration Gate remains blocked

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-11-batch-111-personal-learning-ai-request-context-local-contract.md`
- `docs/05-execution-logs/evidence/batch-111-personal-learning-ai-request-context-local-contract.md`
- `docs/05-execution-logs/audits-reviews/batch-111-personal-learning-ai-request-context-local-contract.md`
- `src/server/models/personal-ai-generation-request.ts`
- `src/server/contracts/personal-ai-generation-request-contract.ts`
- `src/server/validators/personal-ai-generation-request.ts`
- `src/server/validators/personal-ai-generation-request.test.ts`
- `src/server/services/personal-ai-generation-request-context-service.ts`
- `src/server/services/personal-ai-generation-request-context-service.test.ts`
- `src/server/services/personal-ai-generation-request-service.ts`
- `src/server/services/personal-ai-generation-request-service.test.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`

## Implementation Notes

- Added `PersonalAiGenerationRequestContextSelection` with `contextType: none | paper | mock_exam`.
- Added a local request context DTO that exposes only public ids, `personal_auth` boundary metadata, and redacted status.
- Reused the existing personal AI request validator and added a hard rejection for simultaneous `paper` and `mock_exam`
  context selection.
- Extended the existing personal AI generation request DTO with `generationContext.selectedContext`.
- Preserved all existing redaction checks for prompt-like, generated content, provider payload, token, numeric id, and
  plaintext `redeem_code` style inputs.

## Validation

| Command                                                                                                                                                                                                                                                                                                | Result             | Notes                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-context-service.test.ts`                                                                                                                                                                                                  | fail, then pass    | Initial failure was local tooling readiness only: this automation worktree lacked `node_modules`, so Vitest config could not resolve `@vitejs/plugin-react` and `vitest/config`. `D:\tiku\node_modules\.bin` existed; after creating a Git-ignored local junction `node_modules -> D:\tiku\node_modules`, the command passed with 1 file and 5 tests. No dependency install was run. |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                     | pass               | ESLint completed successfully.                                                                                                                                                                                                                                                                                                                                                       |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                | pass               | `tsc --noEmit` completed successfully.                                                                                                                                                                                                                                                                                                                                               |
| `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/validators/personal-ai-generation-request.test.ts`                                                                            | pass               | 3 files and 10 tests passed for affected existing request/route/validator contracts.                                                                                                                                                                                                                                                                                                 |
| `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-context-service.test.ts src/server/services/personal-ai-generation-request-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/validators/personal-ai-generation-request.test.ts` | pass               | Final affected-contract rerun passed with 4 files and 15 tests after neutralizing sensitive fixture names.                                                                                                                                                                                                                                                                           |
| `git diff --check`                                                                                                                                                                                                                                                                                     | pass with warnings | No whitespace errors. Git warned that the script-touched YAML files will normalize CRLF to LF.                                                                                                                                                                                                                                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-111-personal-learning-ai-request-context-local-contract`                                                                                                     | fail, then pass    | Initial failure found this command result and a SHA-shaped `Commit:` anchor were not yet recorded in evidence; rerun passed after evidence update.                                                                                                                                                                                                                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-111-personal-learning-ai-request-context-local-contract`                                                                                                          | pass               | Scope, sensitive evidence scan, and terminology scan passed.                                                                                                                                                                                                                                                                                                                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-111-personal-learning-ai-request-context-local-contract`                                                                                                            | pass               | Git readiness, evidence/audit paths, and accepted ancestor checkpoint policy passed.                                                                                                                                                                                                                                                                                                 |

## Redaction And Blocked Gates

- Evidence records only public-id-shaped fixture values and command summaries.
- No raw prompt, raw generated AI content, provider payload, secret, token, database URL, Authorization header, raw DB
  row, plaintext `redeem_code`, or full `paper` content is recorded.
- Formal `question`, formal `paper`, formal `practice`, formal `mock_exam`, `exam_report`, and `mistake_book` write
  paths were not changed.
- Cost Calibration Gate remains blocked.

## Residual Gaps

- This task proves L2 local contract behavior only.
- L5 UI/browser validation remains blocked to `batch-113`.
- Redacted AI result reference contract remains `batch-112`.
- Provider, env/secret, schema/migration, e2e, staging/prod/cloud/deploy, payment, external-service, PR, force push, and
  Cost Calibration Gate remain blocked without separate approval.
