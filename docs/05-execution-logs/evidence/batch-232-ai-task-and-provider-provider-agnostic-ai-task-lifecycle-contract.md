# Module Run v2 Evidence: batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract

result: pass

## Summary

- module: ai-task-and-provider
- sourcePlanningTask: phase-70-advanced-ai-task-domain-implementation-planning
- targetClosureItem: provider-agnostic AI task lifecycle contracts
- moduleRunVersion: 2
- branch: `codex/batch-232-ai-task-provider-lifecycle-contract`
- implementationDecision: existing source already covers the provider-agnostic lifecycle contract; no `src` files changed.

## Required Anchors

- Batch range: `batch-232`
- RED: existing tests confirmed coverage before any source edit; no source gap found.
- GREEN: `npm.cmd run test:unit -- src/server/models/ai-generation-task.test.ts src/server/validators/ai-task-domain.test.ts src/server/services/ai-task-domain-service.test.ts` passed with 3 files and 11 tests.
- Commit: `6cf60bc2` pre-task seed baseline; final task commit will be recorded after commit creation.
- localFullLoopGate: L2 satisfied by local unit validation without provider/env/schema/dependency changes.
- threadRolloverGate: continue_current_thread; this is the first implementation task after auto-seed and context remains within the approved module boundary.
- nextModuleRunCandidate: continue serially to `batch-233-ai-task-and-provider-local-task-request-policy-and-result-referen` after 232 is merged and pushed.
- blocked remainder: high-risk gates remain separately blocked.
- Cost Calibration Gate remains blocked.

## Validation

- `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-70-advanced-ai-task-domain-implementation-planning -CandidateTaskId batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract -EvidencePath docs\05-execution-logs\evidence\2026-06-21-module-run-v2-auto-seed-ai-task-and-provider.md`: passed.
- `Test-TaskClaimReadiness.ps1 -TaskId batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`: diagnostic parser failure on empty string; not used as the task readiness decision.
- `Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`: passed.
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-work -TaskId batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`: initially blocked on missing plan path, then passed after plan materialization.
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract -PlannedFiles ...`: passed for docs/state planned files.
- `npm.cmd run test -- --run ...`: timed out because the root `test` script runs full unit plus e2e; root cause was wrong script selection, not lifecycle test failure.
- `npm.cmd run test:unit -- src/server/models/ai-generation-task.test.ts src/server/validators/ai-task-domain.test.ts src/server/services/ai-task-domain-service.test.ts`: passed; 3 files, 11 tests.
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract.md docs/05-execution-logs/evidence/batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract.md docs/05-execution-logs/audits-reviews/batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract.md`: passed; unchanged.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `git diff --check`: passed.
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-232-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`: passed.

## Source Coverage

- `src/server/models/ai-generation-task.ts` defines provider-agnostic status values, terminal statuses, retryable and non-retryable failure categories, transition effects, and provider boundary flags with provider/env/payload requirements set to `false`.
- `src/server/models/ai-generation-task.test.ts` asserts lifecycle contract output and transition behavior.
- `src/server/services/ai-task-domain-service.test.ts` asserts local task contracts omit raw prompt, raw answer text, execution payload, and internal ids.
