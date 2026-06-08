# Phase 89 Paper Mock Exam Scope Read Model Implementation Plan

**Task id:** `phase-89-paper-mock-exam-scope-read-model`

**Branch:** `codex/phase-89-paper-mock-exam-scope-read-model`

**Task kind:** `implementation`

## Approval Boundary

The user approved Batch 1 Phase 88-90 small-batch code advancement. Phase 89 is limited to a local `paper` and `mock_exam` scope read-model contract and pure service logic.

Allowed files:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- corresponding `*.test.ts`
- this Phase 89 task plan, evidence, audit review
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
- Phase 87 and Phase 88 task plan, evidence, and audit review
- existing model, contract, validator, and service files under `src/server`

## Implementation Approach

Create a local scope-only read-model contract for `paper` and `mock_exam` context. The slice will describe which public references and allowed taxonomy apply to a future student experience or AI task without exposing formal content.

Planned files:

- `src/server/models/paper-mock-exam-scope.ts`
- `src/server/contracts/paper-mock-exam-scope-contract.ts`
- `src/server/validators/paper-mock-exam-scope.ts`
- `src/server/services/paper-mock-exam-scope-service.ts`
- focused validator and service tests

Behavior:

- Require public references for `user`, `authorization`, and `paper`.
- Allow nullable `mock_exam` public reference.
- Normalize existing `profession`, `subject`, and `paper_type` values.
- Return standard `{ code, message, data }`.
- Return `contentAccessStatus: "scope_only"`.
- Never return DB rows, numeric ids, `paper` content, `question` text, `standard_answer`, `analysis`, answer content, or paper snapshots.
- Keep `audit_log` and `ai_call_log` out of the returned object for this phase; evidence remains redacted.

## TDD Plan

1. Write service tests for full `paper` plus `mock_exam` scope, `paper`-only scope, missing `paper` failure, and content redaction.
2. Write validator tests for valid input normalization and invalid taxonomy rejection.
3. Run focused tests and confirm RED due to missing modules.
4. Implement minimal model, contract, validator, and pure service.
5. Run focused tests and broad gates.

## Validation Commands

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- src/server/services/paper-mock-exam-scope-service.test.ts src/server/validators/paper-mock-exam-scope.test.ts`
- `git diff --check`
- scoped Prettier check for Phase 89 files
- required anchor check for `authorization`, `paper`, `mock_exam`, `question`, `standard_answer`, `analysis`, `audit_log`, `ai_call_log`, `scope_only`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop if this slice requires repository/database access, route handlers, Server Actions, schema/migration, dependency changes, provider/env/secret/staging/prod/cloud/deploy/payment/external-service work, `authorization` permission changes, Cost Calibration Gate execution, or evidence containing sensitive data.
