# Task Plan: batch-208 ops governance authorization quota summary

## Task

- taskId: `batch-208-ops-governance-and-retention-operations-facing-authorization-and-quota-go`
- module: `ops-governance-and-retention`
- targetClosureItem: operations-facing authorization and quota governance summaries
- executionProfile: `local_unit_tdd`
- evidenceMode: full

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Scope

Allowed implementation surfaces:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- task plan, evidence, audit, project-state, and task-queue state files

Blocked surfaces remain unchanged: `.env*`, provider/model calls, package/lockfile/dependency changes, schema/drizzle/migration, cloud/deploy/payment/external-service, PR/force-push, and Cost Calibration Gate.

## Implementation Plan

1. Add a focused failing unit test for an operations-facing authorization/quota governance read model.
2. Implement minimal model, contract, validator, and service code that returns standard `{ code, message, data }` responses.
3. Keep output aggregate-only: counts, quota usage ratio, quota risk status, expiry posture, and redacted evidence status. Do not output raw rows, plaintext `redeem_code`, provider payloads, raw prompt/answer, or publicId inventories.
4. Record RED/GREEN evidence and update audit before closeout.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-75-advanced-retention-log-governance-implementation-planning -CandidateTaskId batch-208-ops-governance-and-retention-operations-facing-authorization-and-quota-go -EvidencePath docs\05-execution-logs\evidence\2026-06-17-module-run-v2-auto-seed-ops-governance-and-retention.md`
- `npm.cmd run test:unit -- src/server/services/ops-governance-authorization-quota-summary-service.test.ts`
- `git diff --check`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-208-ops-governance-and-retention-operations-facing-authorization-and-quota-go`

## Risk Notes

- No repository or database access is introduced.
- No authorization behavior is changed; this is a local read-model contract.
- Evidence must stay redacted and aggregate-only.
