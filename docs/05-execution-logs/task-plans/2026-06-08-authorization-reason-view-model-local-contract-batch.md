# Batch 99 Authorization Reason View Model Local Contract Plan

**Batch id:** `authorization-reason-view-model-local-contract-batch`

**Branch:** `codex/batch-99-authorization-reason-view-model-local-contract`

**Task kind:** `implementation`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Batch 97 reason presentation local contract plan, evidence, and audit review
- Batch 98 reason view section local contract plan, evidence, and audit review
- Existing `authorization` reason view section models, contracts, validators, services, and focused tests
- Evidence Formatting Finalization Rule

## Batch Module Boundary

This batch is limited to local-only `authorization` reason view-model read-model and service-contract pure logic.

It may project Batch 98 `local_view_section_only` outputs into consumer-oriented local view-model contracts for status, `paper` / `mock_exam` context, redacted evidence references, and an aggregate view-model summary. It must not grant, deny, revoke, enforce, reinterpret, or persist real `authorization` permission behavior.

Allowed files:

- `src/server/models/authorization-reason-status-view-model.ts`
- `src/server/contracts/authorization-reason-status-view-model-contract.ts`
- `src/server/validators/authorization-reason-status-view-model.ts`
- `src/server/validators/authorization-reason-status-view-model.test.ts`
- `src/server/services/authorization-reason-status-view-model-service.ts`
- `src/server/services/authorization-reason-status-view-model-service.test.ts`
- `src/server/models/authorization-reason-context-view-model.ts`
- `src/server/contracts/authorization-reason-context-view-model-contract.ts`
- `src/server/validators/authorization-reason-context-view-model.ts`
- `src/server/validators/authorization-reason-context-view-model.test.ts`
- `src/server/services/authorization-reason-context-view-model-service.ts`
- `src/server/services/authorization-reason-context-view-model-service.test.ts`
- `src/server/models/authorization-reason-evidence-view-model.ts`
- `src/server/contracts/authorization-reason-evidence-view-model-contract.ts`
- `src/server/validators/authorization-reason-evidence-view-model.ts`
- `src/server/validators/authorization-reason-evidence-view-model.test.ts`
- `src/server/services/authorization-reason-evidence-view-model-service.ts`
- `src/server/services/authorization-reason-evidence-view-model-service.test.ts`
- `src/server/models/authorization-reason-view-model-summary.ts`
- `src/server/contracts/authorization-reason-view-model-summary-contract.ts`
- `src/server/validators/authorization-reason-view-model-summary.ts`
- `src/server/validators/authorization-reason-view-model-summary.test.ts`
- `src/server/services/authorization-reason-view-model-summary-service.ts`
- `src/server/services/authorization-reason-view-model-summary-service.test.ts`
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

1. `authorization-reason-status-view-model`
   - Add local status view-model contract from Batch 98 status view section DTO input.
   - Focused tests:
     - projects selected `authorization` source and window status items into a compact `local_view_model_only` status model;
     - preserves `local_view_section_only`, selected `authorization` public reference, severity, and reason codes without enforcing permissions;
     - rejects invalid section keys and never returns DB row, numeric `id`, plaintext `redeem_code`, raw `audit_log`, or raw `ai_call_log`.
   - Commit scope: status-view-model model, contract, validator, service, and focused tests.

2. `authorization-reason-context-view-model`
   - Add local context view-model contract for `paper` and `mock_exam` context section DTO input.
   - Focused tests:
     - projects `paper` and `mock_exam` context items into context cards;
     - preserves empty context sections as `[]`;
     - keeps `paper` / `mock_exam` as context only and rejects invalid context fields.
   - Commit scope: context-view-model model, contract, validator, service, and focused tests.

3. `authorization-reason-evidence-view-model`
   - Add local evidence view-model contract for redacted `redeem_code`, `audit_log`, and `ai_call_log` section DTO input.
   - Focused tests:
     - projects only redacted evidence references into evidence chips;
     - preserves `null` public references while keeping `redacted_reference` status;
     - does not return plaintext `redeem_code`, raw evidence payloads, prompt text, provider payloads, generated AI content, DB rows, or numeric ids.
   - Commit scope: evidence-view-model model, contract, validator, service, and focused tests.

4. `authorization-reason-view-model-summary`
   - Add aggregate local view-model summary contract from Batch 98 view section summary DTO input.
   - Focused tests:
     - builds an aggregate `local_view_model_only` contract with status/context/evidence view models;
     - combines view models without changing real `authorization` permissions;
     - rejects inconsistent selected `authorization` references and never returns sensitive data.
   - Commit scope: view-model-summary model, contract, validator, service, and focused tests.

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
- `npm.cmd run test:unit -- src/server/services/authorization-reason-status-view-model-service.test.ts src/server/validators/authorization-reason-status-view-model.test.ts src/server/services/authorization-reason-context-view-model-service.test.ts src/server/validators/authorization-reason-context-view-model.test.ts src/server/services/authorization-reason-evidence-view-model-service.test.ts src/server/validators/authorization-reason-evidence-view-model.test.ts src/server/services/authorization-reason-view-model-summary-service.test.ts src/server/validators/authorization-reason-view-model-summary.test.ts`
- `git diff --check`
- scoped `prettier --write` for Batch 99 source, tests, task plan, evidence, audit review, and state files
- scoped `prettier --check` for the same file list
- required anchor check for `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, `local_view_section_only`, `local_view_model_only`, `redacted`, `redacted_reference`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
