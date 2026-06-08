# Batch 97 Authorization Reason Presentation Local Contract Plan

**Batch id:** `authorization-reason-presentation-local-contract-batch`

**Branch:** `codex/batch-97-authorization-reason-presentation-local-contract`

**Task kind:** `implementation`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Batch 95 display local contract plan, evidence, and audit review
- Batch 96 access reason local contract plan, evidence, and audit review
- Evidence Formatting Finalization Rule
- Existing `authorization` local display and access reason read-model contracts

## Batch Module Boundary

This batch is limited to local-only `authorization` reason presentation read-model and service-contract pure logic.

It may convert Batch 96 `reason_summary_only` outputs into local presentation contracts for ordered reason items, `paper` / `mock_exam` context presentation, redacted evidence reference presentation, and an aggregate presentation summary. It must not grant, deny, revoke, enforce, reinterpret, or persist real `authorization` permission behavior.

Allowed files:

- `src/server/models/authorization-reason-item-presentation.ts`
- `src/server/contracts/authorization-reason-item-presentation-contract.ts`
- `src/server/validators/authorization-reason-item-presentation.ts`
- `src/server/validators/authorization-reason-item-presentation.test.ts`
- `src/server/services/authorization-reason-item-presentation-service.ts`
- `src/server/services/authorization-reason-item-presentation-service.test.ts`
- `src/server/models/authorization-reason-context-presentation.ts`
- `src/server/contracts/authorization-reason-context-presentation-contract.ts`
- `src/server/validators/authorization-reason-context-presentation.ts`
- `src/server/validators/authorization-reason-context-presentation.test.ts`
- `src/server/services/authorization-reason-context-presentation-service.ts`
- `src/server/services/authorization-reason-context-presentation-service.test.ts`
- `src/server/models/authorization-reason-evidence-presentation.ts`
- `src/server/contracts/authorization-reason-evidence-presentation-contract.ts`
- `src/server/validators/authorization-reason-evidence-presentation.ts`
- `src/server/validators/authorization-reason-evidence-presentation.test.ts`
- `src/server/services/authorization-reason-evidence-presentation-service.ts`
- `src/server/services/authorization-reason-evidence-presentation-service.test.ts`
- `src/server/models/authorization-reason-presentation-summary.ts`
- `src/server/contracts/authorization-reason-presentation-summary-contract.ts`
- `src/server/validators/authorization-reason-presentation-summary.ts`
- `src/server/validators/authorization-reason-presentation-summary.test.ts`
- `src/server/services/authorization-reason-presentation-summary-service.ts`
- `src/server/services/authorization-reason-presentation-summary-service.test.ts`
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

1. `authorization-reason-item-presentation`
   - Add local presentation item mapping from Batch 96 reason codes.
   - Focused tests:
     - maps ordered `reason_summary_only` codes to stable presentation keys and severities;
     - keeps `selected_authorization_active` informational and inactive/window/context mismatch codes attention-oriented without enforcing permissions;
     - rejects unknown reason codes and never returns DB row, numeric `id`, plaintext `redeem_code`, raw `audit_log`, or raw `ai_call_log`.
   - Commit scope: item-presentation model, contract, validator, service, and focused tests.

2. `authorization-reason-context-presentation`
   - Add local presentation context contract for `paper` and `mock_exam` reason signals.
   - Focused tests:
     - maps matching and mismatched `paper` / `mock_exam` reason codes to context presentation entries;
     - preserves missing optional contexts as `null`;
     - keeps `paper` / `mock_exam` as context only and rejects invalid context fields.
   - Commit scope: context-presentation model, contract, validator, service, and focused tests.

3. `authorization-reason-evidence-presentation`
   - Add local redacted presentation contract for `redeem_code`, `audit_log`, and `ai_call_log` evidence references.
   - Focused tests:
     - returns only redacted evidence reference presentation rows;
     - preserves `null` for missing optional references;
     - does not return plaintext `redeem_code`, raw evidence payloads, prompt text, provider payloads, generated AI content, DB rows, or numeric ids.
   - Commit scope: evidence-presentation model, contract, validator, service, and focused tests.

4. `authorization-reason-presentation-summary`
   - Add aggregate local presentation summary contract from Batch 96 access reason summary DTO inputs.
   - Focused tests:
     - builds an aggregate local presentation contract with `local_presentation_only` status;
     - combines reason item, context, and redacted evidence presentation without changing real `authorization` permissions;
     - rejects inconsistent selected `authorization` references and never returns sensitive data.
   - Commit scope: presentation-summary model, contract, validator, service, and focused tests.

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
- `npm.cmd run test:unit -- src/server/services/authorization-reason-item-presentation-service.test.ts src/server/validators/authorization-reason-item-presentation.test.ts src/server/services/authorization-reason-context-presentation-service.test.ts src/server/validators/authorization-reason-context-presentation.test.ts src/server/services/authorization-reason-evidence-presentation-service.test.ts src/server/validators/authorization-reason-evidence-presentation.test.ts src/server/services/authorization-reason-presentation-summary-service.test.ts src/server/validators/authorization-reason-presentation-summary.test.ts`
- `git diff --check`
- scoped `prettier --write` for Batch 97 source, tests, task plan, evidence, audit review, and state files
- scoped `prettier --check` for the same file list
- required anchor check for `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, `reason_summary_only`, `local_presentation_only`, `redacted`, `redacted_reference`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
