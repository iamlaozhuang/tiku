# Batch 213 AI Task Request Policy Plan

## Task

- Task id: `batch-213-ai-task-and-provider-local-task-request-policy-and-result-referen`
- Branch: `codex/batch-213-ai-task-request-policy`
- Scope: low-risk local Module Run v2 implementation validation for AI generation task request policy and result reference contracts.

## Readiness Inputs

- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- Read `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- Read `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- Read `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- Read `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- Read `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- Read batch-213 queue block and auto-seed evidence.
- Read existing AI generation task request model, contract, validator, service, and unit test.
- Pre-edit auto-seed readiness passed for candidate batch-213.

## Implementation Strategy

1. Claim batch-213 on the current branch and materialize current user approval for local commit, fast-forward merge,
   push, and cleanup while preserving all high-risk blocks.
2. Replace the advisory focused placeholder with the scoped unit command:
   `npm.cmd run test:unit -- src/server/services/ai-generation-task-request-service.test.ts`.
3. Run the existing focused unit first. If it already validates the contract, do not change source or tests.
4. If the focused unit fails because the contract is missing, follow TDD strictly:
   - write the failing focused test first;
   - verify RED;
   - implement the minimum local source change;
   - verify GREEN.
5. Write redacted evidence and audit records.
6. Run lint, typecheck, `git diff --check`, pre-commit hardening, and module closeout readiness.
7. Commit, fast-forward merge to master, push, and delete the merged short branch under the current user fresh approval.

## Allowed Files

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Capabilities

- No `.env*`.
- No `package.json`, lockfile, dependency change, schema, migration, drizzle, deploy, payment, PR, force-push, provider
  execution, provider configuration, env secret access, database write, staging/prod/cloud action, external service, or
  Cost Calibration Gate execution.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-70-advanced-ai-task-domain-implementation-planning -CandidateTaskId batch-213-ai-task-and-provider-local-task-request-policy-and-result-referen -EvidencePath docs\05-execution-logs\evidence\2026-06-20-module-run-v2-auto-seed-ai-task-and-provider.md`
- `npm.cmd run test:unit -- src/server/services/ai-generation-task-request-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-213-ai-task-and-provider-local-task-request-policy-and-result-referen`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-213-ai-task-and-provider-local-task-request-policy-and-result-referen`
