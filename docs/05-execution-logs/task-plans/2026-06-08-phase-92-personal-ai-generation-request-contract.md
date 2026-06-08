# Phase 92 Personal AI Generation Request Contract Implementation Plan

**Task id:** `phase-92-personal-ai-generation-request-contract`

**Branch:** `codex/phase-92-personal-ai-generation-request-contract`

**Task kind:** `implementation`

## Approval Boundary

The user requested continuing to the next batch after Batch 1 completion. Batch 2 follows the same low-risk local code boundary: local read-model / service-contract / validator / pure service logic only.

Allowed files:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- corresponding `*.test.ts`
- this Phase 92 task plan, evidence, audit review
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
- Phase 88 `ai-task-domain` local contract
- Phase 91 `redeem_code` redacted reference contract
- existing AI/RAG model references under `src/server/models/ai-rag.ts`

## Implementation Approach

Create a local personal AI generation request read-model contract that represents future `ai_explanation`, `ai_hint`, and `kn_recommendation` requests without executing AI.

Planned files:

- `src/server/models/personal-ai-generation-request.ts`
- `src/server/contracts/personal-ai-generation-request-contract.ts`
- `src/server/validators/personal-ai-generation-request.ts`
- `src/server/services/personal-ai-generation-request-service.ts`
- focused validator and service tests

Behavior:

- Require public references for `user`, `authorization`, and `question`.
- Allow nullable `answer_record`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log` public references.
- Allow only `explanation`, `hint`, and `kn_recommendation` local generation types.
- Return standard `{ code, message, data }`.
- Return `runtimeStatus: "local_contract_only"` and `redactionStatus: "redacted"`.
- Never return prompt text, raw answer, generated content, model output, provider payload, plaintext `redeem_code`, DB rows, numeric ids, secrets, or tokens.

## TDD Plan

1. Write service tests for explanation/hint/recommendation request DTOs, scoring rejection, and redaction.
2. Write validator tests for valid input normalization and invalid generation type.
3. Run focused tests and confirm RED due to missing modules.
4. Implement minimal model, contract, validator, and pure service.
5. Run focused tests and broad gates.

## Validation Commands

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-service.test.ts src/server/validators/personal-ai-generation-request.test.ts`
- `git diff --check`
- scoped Prettier check for Phase 92 files
- required anchor check for `authorization`, `redeem_code`, `paper`, `mock_exam`, `answer_record`, `audit_log`, `ai_call_log`, `ai_explanation`, `ai_hint`, `kn_recommendation`, `local_contract_only`, `redacted`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop if this slice requires repository/database access, route handlers, Server Actions, schema/migration, dependency changes, provider/env/secret/staging/prod/cloud/deploy/payment/external-service work, `authorization` permission changes, Cost Calibration Gate execution, or evidence containing sensitive data.
