# Phase 90 Audit AI Call Log Redacted Reference Implementation Plan

**Task id:** `phase-90-audit-ai-call-log-redacted-reference`

**Branch:** `codex/phase-90-audit-ai-call-log-redacted-reference`

**Task kind:** `implementation`

## Approval Boundary

The user approved Batch 1 Phase 88-90 small-batch code advancement. Phase 90 is limited to a local `audit_log` and `ai_call_log` redacted reference contract and pure service logic.

Allowed files:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- corresponding `*.test.ts`
- this Phase 90 task plan, evidence, audit review
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files and actions:

- dependency, package, lockfile
- schema, migration, `src/db/schema/**`, `drizzle/**`
- `scripts/**`, `e2e/**`
- repository, API route, Server Action
- provider, env/secret, staging/prod/cloud/deploy, payment, external-service
- `authorization` permission model change
- Cost Calibration Gate execution

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/03-standards/glossary.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Phase 89 task plan and evidence
- existing `audit_log` and `ai_call_log` contract/model references under `src/server`

## Implementation Approach

Create a local read-model contract that represents `audit_log` and `ai_call_log` only as redacted public references. The slice is for downstream service contracts and evidence boundaries, not runtime persistence.

Planned files:

- `src/server/models/audit-ai-call-log-reference.ts`
- `src/server/contracts/audit-ai-call-log-reference-contract.ts`
- `src/server/validators/audit-ai-call-log-reference.ts`
- `src/server/services/audit-ai-call-log-reference-service.ts`
- focused validator and service tests

Behavior:

- Require public references for `user` and `authorization`.
- Require at least one of `audit_log` or `ai_call_log` public reference.
- Allow nullable `paper` and `mock_exam` public scope references.
- Return standard `{ code, message, data }`.
- Return `redactionStatus: "redacted"` for log references and `referenceStatus: "redacted_reference"`.
- Never return DB rows, numeric ids, metadata payloads, raw prompt, raw answer, model output, request IP, secrets, tokens, or log payloads.

## TDD Plan

1. Write service tests for combined `audit_log` plus `ai_call_log` references, single-reference support, missing-reference failure, and payload redaction.
2. Write validator tests for valid input normalization and invalid missing-reference input.
3. Run focused tests and confirm RED due to missing modules.
4. Implement minimal model, contract, validator, and pure service.
5. Run focused tests and broad gates.

## Validation Commands

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- src/server/services/audit-ai-call-log-reference-service.test.ts src/server/validators/audit-ai-call-log-reference.test.ts`
- `git diff --check`
- scoped Prettier check for Phase 90 files
- required anchor check for `authorization`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, `redacted`, `redacted_reference`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop if this slice requires repository/database access, route handlers, Server Actions, schema/migration, dependency changes, provider/env/secret/staging/prod/cloud/deploy/payment/external-service work, `authorization` permission changes, Cost Calibration Gate execution, or evidence containing sensitive data.
