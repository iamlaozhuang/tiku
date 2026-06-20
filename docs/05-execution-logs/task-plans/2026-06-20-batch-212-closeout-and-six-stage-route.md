# Batch 212 Closeout And Six Stage Route Plan

## Context

- Task id: `batch-212-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`
- Branch: `codex/batch-212-ai-task-provider-lifecycle`
- Execution request: implement the batch-212 closeout first, then use the 6-stage governance route as the main path.
- Boundary: complete batch-212 locally only; merge, push, and branch cleanup require later fresh approval.

## Implementation Steps

1. Run closeout readiness before evidence finalization and record the expected RED findings.
2. Run `npm.cmd run test:unit -- src/server/models/ai-generation-task.test.ts`.
3. Run auto-seed readiness, lint, typecheck, and `git diff --check`.
4. If all validation passes without source changes, update batch-212 evidence/audit and commit the validation evidence.
5. Record the validation commit hash in evidence, close the task in queue/project state, run closeout readiness again, and
   commit the closeout state.
6. Stop before merge/push/cleanup. Stage 1 queue health work starts only after explicit approval to integrate batch-212.

## Six Stage Route After Batch 212 Integration

1. Queue health baseline: archive traceable terminal tasks until `archiveCandidateCount` is near zero.
2. Blocked item routing: classify remaining blocked tasks into approval, exact-scope, validation failure, high-risk, and
   product-choice groups.
3. Low-risk docs/state decision packages: clarify approval/scope packages without executing high-risk capability.
4. Executable low-risk local tasks: process only dependency-satisfied tasks with exact file and validation boundaries.
5. Verification and experience closure: sync coverage matrix only from verified local evidence.
6. High-risk capability lanes: handle provider, schema, deploy, payment, OCR, export, and Cost Calibration as isolated
   fresh-approval tasks.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-212-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`
- `npm.cmd run test:unit -- src/server/models/ai-generation-task.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-70-advanced-ai-task-domain-implementation-planning -CandidateTaskId batch-212-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract -EvidencePath docs\05-execution-logs\evidence\2026-06-20-module-run-v2-auto-seed-ai-task-and-provider.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`

## Stop Conditions

- Stop if lifecycle unit tests fail.
- Stop if any required validation needs `.env*`, provider/model calls, schema/migration, dependency changes, deploy,
  payment, PR, force-push, or Cost Calibration Gate.
- Stop before merge/push/cleanup until explicit approval is provided.
