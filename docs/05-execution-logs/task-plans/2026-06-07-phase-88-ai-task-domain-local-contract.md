# Phase 88 AI Task Domain Local Contract Implementation Plan

**Task id:** `phase-88-ai-task-domain-local-contract`

**Branch:** `codex/phase-88-ai-task-domain-local-contract`

**Task kind:** `implementation`

## Approval Boundary

The user approved Batch 1 Phase 88-90 small-batch code advancement. Phase 88 is limited to a local AI task domain contract and pure service logic.

Allowed files:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- corresponding `*.test.ts`
- this Phase 88 task plan, evidence, audit review
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

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- existing AI/RAG model, contract, validator, and service files under `src/server`
- Phase 87 evidence and current `master` baseline

## Implementation Approach

Create a local AI task domain read-model contract that can describe a future AI task request without executing it.

Planned files:

- `src/server/models/ai-task-domain.ts`
- `src/server/contracts/ai-task-domain-contract.ts`
- `src/server/validators/ai-task-domain.ts`
- `src/server/services/ai-task-domain-service.ts`
- focused validator and service tests

Behavior:

- Normalize an AI function type using existing `AiFuncType`.
- Require public references only for `user`, `authorization`, `question`, and at least one AI target context.
- Keep `paper` and `mock_exam` as public scope references only.
- Keep `audit_log` and `ai_call_log` as redacted public references only.
- Return standard `{ code, message, data }`.
- Return `runtimeStatus: "local_contract_only"` and never execute AI.
- Do not return prompt text, raw answer text, model output, provider payload, secrets, tokens, or numeric ids.

## TDD Plan

1. Write service tests for scoring, explanation/hint style AI function inputs, missing scope failure, and redaction.
2. Write validator tests for valid input normalization and invalid AI function type.
3. Run focused tests and confirm RED due to missing modules.
4. Implement minimal model, contract, validator, and pure service.
5. Run focused tests and broad gates.

## Validation Commands

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- src/server/services/ai-task-domain-service.test.ts src/server/validators/ai-task-domain.test.ts`
- `git diff --check`
- scoped Prettier check for Phase 88 files
- required anchor check for `authorization`, `question`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, `redacted`, `local_contract_only`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop if this slice requires repository/database access, route handlers, Server Actions, schema/migration, dependency changes, provider/env/secret/staging/prod/cloud/deploy/payment/external-service work, `authorization` permission changes, Cost Calibration Gate execution, or evidence containing sensitive data.
