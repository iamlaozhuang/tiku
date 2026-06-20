# Batch 230 Ops Governance Log Retention Redaction Contracts Plan

## Task

- Task id: `batch-230-ops-governance-and-retention-audit-log-and-ai-call-log-retention-and-reda`.
- Branch: `codex/batch-230-ops-governance-log-retention`.
- Target closure item: `audit_log` and `ai_call_log` retention and redaction contracts.
- Execution profile: `local_unit_tdd`.

## Standards Read

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- All ADRs under `docs/02-architecture/adr/`.

## Current Gate State

- L123 classifier gate returns `no_l123_classification` for this task.
- Serial executor claim preflight passed and the task was claimed through `Invoke-ModuleRunV2SerialAutodriveExecutor.ps1 -Execute`.
- High-risk gates remain blocked, including env/provider/schema/migration/dependency/deploy/payment/destructive DB/model calls and Cost Calibration Gate.

## Implementation Strategy

1. Replace the generated advisory focused placeholder with the real focused unit command:
   `npm.cmd run test:unit -- src/server/services/ops-governance-log-retention-redaction-contracts-service.test.ts`.
2. Prefer verification of the existing implementation over source edits.
3. Run readiness, focused unit, lint, typecheck, `git diff --check`, pre-commit hardening, module closeout readiness, and pre-push readiness gates.
4. Record redacted evidence and audit review.
5. Create a validation commit, then a closeout commit, FF merge to `master`, push `origin/master`, and delete the merged short branch.

## Expected Source Scope

- `src/server/models/ops-governance-log-retention-redaction-contracts.ts`.
- `src/server/contracts/ops-governance-log-retention-redaction-contracts-contract.ts`.
- `src/server/validators/ops-governance-log-retention-redaction-contracts.ts`.
- `src/server/services/ops-governance-log-retention-redaction-contracts-service.ts`.
- `src/server/services/ops-governance-log-retention-redaction-contracts-service.test.ts`.

No source edit is planned if the focused unit and local gates pass.

## Evidence And State Scope

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-20-batch-230-ops-governance-log-retention-redaction-contracts.md`.
- `docs/05-execution-logs/evidence/batch-230-ops-governance-and-retention-audit-log-and-ai-call-log-retention-and-reda.md`.
- `docs/05-execution-logs/audits-reviews/batch-230-ops-governance-and-retention-audit-log-and-ai-call-log-retention-and-reda.md`.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-75-advanced-retention-log-governance-implementation-planning -CandidateTaskId batch-230-ops-governance-and-retention-audit-log-and-ai-call-log-retention-and-reda -EvidencePath docs\05-execution-logs\evidence\2026-06-20-ops-governance-and-retention-auto-seed.md`
- `npm.cmd run test:unit -- src/server/services/ops-governance-log-retention-redaction-contracts-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-230-ops-governance-and-retention-audit-log-and-ai-call-log-retention-and-reda`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-230-ops-governance-and-retention-audit-log-and-ai-call-log-retention-and-reda`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-230-ops-governance-and-retention-audit-log-and-ai-call-log-retention-and-reda`

## Redaction

Evidence will contain only task ids, command names, aggregate pass/fail results, commit hashes, and redacted metadata. It will not include secrets, database URLs, Authorization headers, raw employee answer text, full paper content, raw prompts, raw generated AI content, provider payloads, internal DB rows, plaintext `redeem_code`, raw `audit_log` rows, or raw `ai_call_log` rows.
