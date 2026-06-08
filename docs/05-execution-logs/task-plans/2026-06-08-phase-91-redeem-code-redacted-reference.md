# Phase 91 Redeem Code Redacted Reference Implementation Plan

**Task id:** `phase-91-redeem-code-redacted-reference`

**Branch:** `codex/phase-91-redeem-code-redacted-reference`

**Task kind:** `implementation`

## Approval Boundary

The user requested continuing to the next batch after Batch 1 completion. Batch 2 follows the same low-risk local code boundary: local read-model / service-contract / validator / pure service logic only.

Allowed files:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- corresponding `*.test.ts`
- this Phase 91 task plan, evidence, audit review
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
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Phase 87-90 local contract files and evidence
- existing `redeem_code` model, validator, contract, and service references under `src/server`

## Implementation Approach

Create a local read-model contract that represents `redeem_code` only as a redacted public reference tied to `authorization` and optional `audit_log` / `ai_call_log` evidence references.

Planned files:

- `src/server/models/redeem-code-reference.ts`
- `src/server/contracts/redeem-code-reference-contract.ts`
- `src/server/validators/redeem-code-reference.ts`
- `src/server/services/redeem-code-reference-service.ts`
- focused validator and service tests

Behavior:

- Require public references for `user`, `authorization`, and `redeem_code`.
- Allow nullable `paper`, `mock_exam`, `audit_log`, and `ai_call_log` public references.
- Return standard `{ code, message, data }`.
- Return `redactionStatus: "redacted"` and `referenceStatus: "redacted_reference"`.
- Never return plaintext `redeem_code`, code hash, DB rows, numeric ids, secrets, tokens, or evidence payloads.

## TDD Plan

1. Write service tests for redacted `redeem_code` reference output, nullable scope/evidence, missing reference failure, and plaintext redaction.
2. Write validator tests for valid input normalization and invalid missing `redeem_code` input.
3. Run focused tests and confirm RED due to missing modules.
4. Implement minimal model, contract, validator, and pure service.
5. Run focused tests and broad gates.

## Validation Commands

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- src/server/services/redeem-code-reference-service.test.ts src/server/validators/redeem-code-reference.test.ts`
- `git diff --check`
- scoped Prettier check for Phase 91 files
- required anchor check for `authorization`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, `redacted`, `redacted_reference`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop if this slice requires repository/database access, route handlers, Server Actions, schema/migration, dependency changes, provider/env/secret/staging/prod/cloud/deploy/payment/external-service work, `authorization` permission changes, Cost Calibration Gate execution, or evidence containing sensitive data.
