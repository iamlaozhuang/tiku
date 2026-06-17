# Batch 192 Redeem Code Audit Log Ai Call Log Redacted References Plan

## Scope

- Task: `batch-192-authorization-and-access-redeem-code-audit-log-and-ai-call-log-redact`
- Target closure: `redeem_code`, `audit_log`, and `ai_call_log` redacted references.
- Execution profile: `local_unit_tdd`
- Evidence mode: `full`
- Validation policy: `local_unit`
- Allowed code surfaces: `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, `src/server/services/**`.
- Blocked surfaces: `.env*`, package and lock files, `src/db/schema/**`, `drizzle/**`, provider/model calls, staging/prod/cloud/deploy/payment/external-service, PR, force push, and Cost Calibration Gate.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `src/server/models/redeem-code-reference.ts`
- `src/server/contracts/redeem-code-reference-contract.ts`
- `src/server/services/redeem-code-reference-service.ts`
- `src/server/services/redeem-code-reference-service.test.ts`
- `src/server/validators/redeem-code-reference.ts`

## Local Reality

The existing `redeem-code-reference` service already returns a redacted `redeemCodeReference`, redacted `auditLogPublicId` and `aiCallLogPublicId` evidence references, nullable paper/mock_exam scope, and tests that prevent numeric ids, plaintext redeem_code values, code hashes, raw audit payloads, raw AI call payloads, and private fixture markers from leaking. Batch 192 will add only an explicit local redacted-reference scope marker.

## TDD Plan

1. RED: require `redactedReferenceScopeStatus: "redeem_code_audit_ai_call_log_only"` in `redeem-code-reference-service.test.ts`.
2. GREEN: add the minimal model/contract/service mapping for that status marker.
3. Keep existing redaction behavior and invalid input behavior unchanged.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/redeem-code-reference-service.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-69-advanced-authorization-context-implementation-planning -CandidateTaskId batch-192-authorization-and-access-redeem-code-audit-log-and-ai-call-log-redact`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-192-authorization-and-access-redeem-code-audit-log-and-ai-call-log-redact`
