# Batch 214 AI Log Evidence Reference Plan

## Task

- Task id: `batch-214-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence`
- Branch: `codex/batch-214-ai-log-evidence-reference`
- Scope: low-risk local Module Run v2 validation for redacted `audit_log` and `ai_call_log` evidence references.

## Readiness Inputs

- Read project standards and ADRs during the stage 4 batch-213/batch-214 sequence.
- Read batch-214 queue block and auto-seed evidence.
- Read existing AI generation task log evidence reference model, contract, validator, service, and unit test.
- Pre-edit auto-seed readiness passed for candidate batch-214.

## Implementation Strategy

1. Claim batch-214 on the current branch and materialize current user approval for local commit, fast-forward merge,
   push, and cleanup while preserving all high-risk blocks.
2. Replace the advisory focused placeholder with the scoped unit command:
   `npm.cmd run test:unit -- src/server/services/ai-generation-task-log-evidence-reference-service.test.ts`.
3. Run the existing focused unit first. If it already validates the contract, do not change source or tests.
4. If the focused unit fails because the contract is missing, follow RED/GREEN TDD before source changes.
5. Write redacted evidence and audit records.
6. Run lint, typecheck, `git diff --check`, pre-commit hardening, and module closeout readiness.
7. Commit, fast-forward merge to master, push, and delete the merged short branch under the current user fresh approval.

## Boundaries

- No `.env*`, dependency, lockfile, schema, migration, drizzle, provider execution, provider configuration, deploy,
  payment, PR, force-push, external service, or Cost Calibration Gate work.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-70-advanced-ai-task-domain-implementation-planning -CandidateTaskId batch-214-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence -EvidencePath docs\05-execution-logs\evidence\2026-06-20-module-run-v2-auto-seed-ai-task-and-provider.md`
- `npm.cmd run test:unit -- src/server/services/ai-generation-task-log-evidence-reference-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-214-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-214-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence`
