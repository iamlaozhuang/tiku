# Batch 100 Authorization Reason View Model Selector Local Contract Plan

**Batch id:** `authorization-reason-view-model-selector-local-contract-batch`

**Branch:** `codex/batch-100-authorization-reason-view-model-selector-local-contract`

**Task kind:** `implementation`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Batch 99 reason view-model local contract plan, evidence, and audit review
- Existing `authorization` reason view-model contracts, validators, services, and focused tests
- Evidence Formatting Finalization Rule

## Batch Module Boundary

This batch is limited to local-only `authorization` reason view-model selector read-model and service-contract pure logic.

It may select stable summary values from Batch 99 `local_view_model_only` outputs for status, `paper` / `mock_exam` context, redacted evidence references, and an aggregate selector summary. It must not grant, deny, revoke, enforce, reinterpret, or persist real `authorization` permission behavior.

Allowed files:

- `src/server/models/authorization-reason-status-selector.ts`
- `src/server/contracts/authorization-reason-status-selector-contract.ts`
- `src/server/validators/authorization-reason-status-selector.ts`
- `src/server/validators/authorization-reason-status-selector.test.ts`
- `src/server/services/authorization-reason-status-selector-service.ts`
- `src/server/services/authorization-reason-status-selector-service.test.ts`
- `src/server/models/authorization-reason-context-selector.ts`
- `src/server/contracts/authorization-reason-context-selector-contract.ts`
- `src/server/validators/authorization-reason-context-selector.ts`
- `src/server/validators/authorization-reason-context-selector.test.ts`
- `src/server/services/authorization-reason-context-selector-service.ts`
- `src/server/services/authorization-reason-context-selector-service.test.ts`
- `src/server/models/authorization-reason-evidence-selector.ts`
- `src/server/contracts/authorization-reason-evidence-selector-contract.ts`
- `src/server/validators/authorization-reason-evidence-selector.ts`
- `src/server/validators/authorization-reason-evidence-selector.test.ts`
- `src/server/services/authorization-reason-evidence-selector-service.ts`
- `src/server/services/authorization-reason-evidence-selector-service.test.ts`
- `src/server/models/authorization-reason-selector-summary.ts`
- `src/server/contracts/authorization-reason-selector-summary-contract.ts`
- `src/server/validators/authorization-reason-selector-summary.ts`
- `src/server/validators/authorization-reason-selector-summary.test.ts`
- `src/server/services/authorization-reason-selector-summary-service.ts`
- `src/server/services/authorization-reason-selector-summary-service.test.ts`
- this batch task plan
- batch rollup evidence and audit review
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files and actions:

- dependency, package, or lockfile changes
- schema, migration, `src/db/schema/**`, or `drizzle/**`
- `.env.local`, `.env.example`, `scripts/**`, or `e2e/**`
- repository, API route, or Server Action work
- provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work
- real `authorization` permission model changes, new role/permission/quota rules, or enforcement behavior
- Cost Calibration Gate execution

## Subtasks

1. `authorization-reason-status-selector`
   - Add local selector contract from Batch 99 status view-model DTO input.
   - Focused tests:
     - selects selected `authorization` public reference, highest severity, primary reason, and row count;
     - preserves `local_view_model_only` without enforcing permissions;
     - rejects invalid model keys and never returns DB row, numeric `id`, plaintext `redeem_code`, raw `audit_log`, or raw `ai_call_log`.
   - Commit scope: status-selector model, contract, validator, service, and focused tests.

2. `authorization-reason-context-selector`
   - Add local selector contract for Batch 99 `paper` and `mock_exam` context cards.
   - Focused tests:
     - selects first `paper` and `mock_exam` public references and context count;
     - preserves missing contexts as `null`;
     - keeps `paper` / `mock_exam` as context only and rejects invalid context cards.
   - Commit scope: context-selector model, contract, validator, service, and focused tests.

3. `authorization-reason-evidence-selector`
   - Add local selector contract for Batch 99 redacted `redeem_code`, `audit_log`, and `ai_call_log` chips.
   - Focused tests:
     - selects only redacted evidence reference metadata by evidence type;
     - preserves `null` public references while keeping `redacted_reference` status;
     - does not return plaintext `redeem_code`, raw evidence payloads, prompt text, provider payloads, generated AI content, DB rows, or numeric ids.
   - Commit scope: evidence-selector model, contract, validator, service, and focused tests.

4. `authorization-reason-selector-summary`
   - Add aggregate local selector summary contract from Batch 99 view-model summary DTO input.
   - Focused tests:
     - builds an aggregate `local_selector_only` contract with status/context/evidence selectors;
     - combines selectors without changing real `authorization` permissions;
     - rejects inconsistent selected `authorization` references and never returns sensitive data.
   - Commit scope: selector-summary model, contract, validator, service, and focused tests.

## TDD Process

Each implementation subtask must follow RED -> GREEN -> focused verification:

1. Write focused unit tests first.
2. Run the focused test command and confirm RED for missing module or missing behavior.
3. Implement the smallest pure logic needed to pass.
4. Re-run the same focused tests and confirm GREEN.
5. Commit only that subtask's files.

## Risk Stop Conditions

Stop immediately if any subtask requires:

- repository or database access;
- API route or Server Action changes;
- schema, migration, package, lockfile, dependency, script, or e2e changes;
- provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work;
- real `authorization` permission model changes, new roles, new permissions, or quota enforcement;
- Cost Calibration Gate execution;
- evidence containing plaintext `redeem_code`, secrets, tokens, raw provider payloads, prompt text, generated AI content, DB rows, or auto-increment ids;
- unexpected Git state or scope drift outside the allowed batch files.

## Batch-Level Validation Matrix

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- src/server/services/authorization-reason-status-selector-service.test.ts src/server/validators/authorization-reason-status-selector.test.ts src/server/services/authorization-reason-context-selector-service.test.ts src/server/validators/authorization-reason-context-selector.test.ts src/server/services/authorization-reason-evidence-selector-service.test.ts src/server/validators/authorization-reason-evidence-selector.test.ts src/server/services/authorization-reason-selector-summary-service.test.ts src/server/validators/authorization-reason-selector-summary.test.ts`
- `git diff --check`
- scoped `prettier --write` for Batch 100 source, tests, task plan, evidence, audit review, and state files
- scoped `prettier --check` for the same file list
- required anchor check for `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, `local_view_model_only`, `local_selector_only`, `redacted`, `redacted_reference`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
