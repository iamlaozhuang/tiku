# Batch 98 Authorization Reason View Section Local Contract Plan

**Batch id:** `authorization-reason-view-section-local-contract-batch`

**Branch:** `codex/batch-98-authorization-reason-view-section-local-contract`

**Task kind:** `implementation`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Batch 96 access reason local contract plan, evidence, and audit review
- Batch 97 reason presentation local contract plan, evidence, and audit review
- Evidence Formatting Finalization Rule
- Existing `authorization` reason presentation models, contracts, validators, services, and focused tests

## Batch Module Boundary

This batch is limited to local-only `authorization` reason view section read-model and service-contract pure logic.

It may organize Batch 97 `local_presentation_only` outputs into local view sections for status, `paper` / `mock_exam` context, redacted evidence references, and an aggregate view section summary. It must not grant, deny, revoke, enforce, reinterpret, or persist real `authorization` permission behavior.

Allowed files:

- `src/server/models/authorization-reason-status-view-section.ts`
- `src/server/contracts/authorization-reason-status-view-section-contract.ts`
- `src/server/validators/authorization-reason-status-view-section.ts`
- `src/server/validators/authorization-reason-status-view-section.test.ts`
- `src/server/services/authorization-reason-status-view-section-service.ts`
- `src/server/services/authorization-reason-status-view-section-service.test.ts`
- `src/server/models/authorization-reason-context-view-section.ts`
- `src/server/contracts/authorization-reason-context-view-section-contract.ts`
- `src/server/validators/authorization-reason-context-view-section.ts`
- `src/server/validators/authorization-reason-context-view-section.test.ts`
- `src/server/services/authorization-reason-context-view-section-service.ts`
- `src/server/services/authorization-reason-context-view-section-service.test.ts`
- `src/server/models/authorization-reason-evidence-view-section.ts`
- `src/server/contracts/authorization-reason-evidence-view-section-contract.ts`
- `src/server/validators/authorization-reason-evidence-view-section.ts`
- `src/server/validators/authorization-reason-evidence-view-section.test.ts`
- `src/server/services/authorization-reason-evidence-view-section-service.ts`
- `src/server/services/authorization-reason-evidence-view-section-service.test.ts`
- `src/server/models/authorization-reason-view-section-summary.ts`
- `src/server/contracts/authorization-reason-view-section-summary-contract.ts`
- `src/server/validators/authorization-reason-view-section-summary.ts`
- `src/server/validators/authorization-reason-view-section-summary.test.ts`
- `src/server/services/authorization-reason-view-section-summary-service.ts`
- `src/server/services/authorization-reason-view-section-summary-service.test.ts`
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

1. `authorization-reason-status-view-section`
   - Add local status section contract from Batch 97 source and reason item presentation entries.
   - Focused tests:
     - groups selected `authorization` source and window reason entries into a status view section;
     - preserves `local_presentation_only` and section-level severity without enforcing permissions;
     - rejects missing selected `authorization` references and never returns DB row, numeric `id`, plaintext `redeem_code`, raw `audit_log`, or raw `ai_call_log`.
   - Commit scope: status-view-section model, contract, validator, service, and focused tests.

2. `authorization-reason-context-view-section`
   - Add local context section contract for `paper` and `mock_exam` context presentation entries.
   - Focused tests:
     - groups `paper` and `mock_exam` entries into a context view section;
     - preserves missing optional contexts as an empty section item list;
     - keeps `paper` / `mock_exam` as context only and rejects invalid context fields.
   - Commit scope: context-view-section model, contract, validator, service, and focused tests.

3. `authorization-reason-evidence-view-section`
   - Add local redacted evidence section contract for `redeem_code`, `audit_log`, and `ai_call_log`.
   - Focused tests:
     - groups only redacted evidence references into an evidence view section;
     - preserves `null` public references while keeping redacted_reference status;
     - does not return plaintext `redeem_code`, raw evidence payloads, prompt text, provider payloads, generated AI content, DB rows, or numeric ids.
   - Commit scope: evidence-view-section model, contract, validator, service, and focused tests.

4. `authorization-reason-view-section-summary`
   - Add aggregate local view section summary contract from Batch 97 presentation summary DTO inputs.
   - Focused tests:
     - builds an aggregate `local_view_section_only` contract with status/context/evidence sections;
     - combines sections without changing real `authorization` permissions;
     - rejects inconsistent selected `authorization` references and never returns sensitive data.
   - Commit scope: view-section-summary model, contract, validator, service, and focused tests.

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
- `npm.cmd run test:unit -- src/server/services/authorization-reason-status-view-section-service.test.ts src/server/validators/authorization-reason-status-view-section.test.ts src/server/services/authorization-reason-context-view-section-service.test.ts src/server/validators/authorization-reason-context-view-section.test.ts src/server/services/authorization-reason-evidence-view-section-service.test.ts src/server/validators/authorization-reason-evidence-view-section.test.ts src/server/services/authorization-reason-view-section-summary-service.test.ts src/server/validators/authorization-reason-view-section-summary.test.ts`
- `git diff --check`
- scoped `prettier --write` for Batch 98 source, tests, task plan, evidence, audit review, and state files
- scoped `prettier --check` for the same file list
- required anchor check for `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, `local_presentation_only`, `local_view_section_only`, `redacted`, `redacted_reference`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
