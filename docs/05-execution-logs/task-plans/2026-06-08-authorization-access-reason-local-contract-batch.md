# Batch 96 Authorization Access Reason Local Contract Plan

**Batch id:** `authorization-access-reason-local-contract-batch`

**Branch:** `codex/batch-96-authorization-access-reason-local-contract`

**Task kind:** `implementation`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Batch 94 read-model local contract plan/evidence/audit review
- Batch 95 display local contract plan/evidence/audit review
- Evidence Formatting Finalization Rule
- Existing `authorization` local models, contracts, validators, services, and focused tests

## Batch Module Boundary

This batch is limited to local-only `authorization` access reason read-model and service-contract pure logic.

It may summarize why local display metadata looks usable, not started, expired, context-mismatched, inactive, missing evidence reference, or insufficient for display. It must not grant, deny, revoke, enforce, reinterpret, or persist real `authorization` permission behavior.

Allowed files:

- `src/server/models/authorization-window-reason-summary.ts`
- `src/server/contracts/authorization-window-reason-summary-contract.ts`
- `src/server/validators/authorization-window-reason-summary.ts`
- `src/server/validators/authorization-window-reason-summary.test.ts`
- `src/server/services/authorization-window-reason-summary-service.ts`
- `src/server/services/authorization-window-reason-summary-service.test.ts`
- `src/server/models/authorization-context-reason-summary.ts`
- `src/server/contracts/authorization-context-reason-summary-contract.ts`
- `src/server/validators/authorization-context-reason-summary.ts`
- `src/server/validators/authorization-context-reason-summary.test.ts`
- `src/server/services/authorization-context-reason-summary-service.ts`
- `src/server/services/authorization-context-reason-summary-service.test.ts`
- `src/server/models/authorization-source-reason-summary.ts`
- `src/server/contracts/authorization-source-reason-summary-contract.ts`
- `src/server/validators/authorization-source-reason-summary.ts`
- `src/server/validators/authorization-source-reason-summary.test.ts`
- `src/server/services/authorization-source-reason-summary-service.ts`
- `src/server/services/authorization-source-reason-summary-service.test.ts`
- `src/server/models/authorization-access-reason-summary.ts`
- `src/server/contracts/authorization-access-reason-summary-contract.ts`
- `src/server/validators/authorization-access-reason-summary.ts`
- `src/server/validators/authorization-access-reason-summary.test.ts`
- `src/server/services/authorization-access-reason-summary-service.ts`
- `src/server/services/authorization-access-reason-summary-service.test.ts`
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

1. `authorization-window-reason-summary`
   - Add local `authorization` window reason summary from starts/expires/current timestamps.
   - Focused tests:
     - summarizes `within_window`, `not_started`, `expired`, and open-ended windows as `reason_summary_only`;
     - rejects invalid timestamps;
     - never returns DB row, numeric `id`, plaintext `redeem_code`, or raw evidence fields.
   - Commit scope: window-reason model, contract, validator, service, and focused tests.

2. `authorization-context-reason-summary`
   - Add local context reason summary for `paper` and `mock_exam` context matching.
   - Focused tests:
     - marks matching context as `context_matches_authorization`;
     - marks `paper` / `mock_exam` mismatches as `context_mismatch`;
     - keeps `paper` / `mock_exam` as context only and rejects invalid context values.
   - Commit scope: context-reason model, contract, validator, service, and focused tests.

3. `authorization-source-reason-summary`
   - Add local source reason summary for selected `personal_auth` or `org_auth` metadata.
   - Focused tests:
     - summarizes active `personal_auth` and `org_auth` sources without changing permission rules;
     - flags inactive or missing selected `authorization` as reason-only;
     - exposes `organizationPublicId` only as a public reference.
   - Commit scope: source-reason model, contract, validator, service, and focused tests.

4. `authorization-access-reason-summary`
   - Add aggregate local access reason contract combining window, context, source, and redacted evidence reference signals.
   - Focused tests:
     - returns an aggregate `reason_summary_only` contract with ordered reason codes;
     - keeps `redeem_code`, `audit_log`, and `ai_call_log` as redacted references only;
     - rejects inconsistent selected `authorization` references and never returns sensitive data.
   - Commit scope: access-reason model, contract, validator, service, and focused tests.

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
- `npm.cmd run test:unit -- src/server/services/authorization-window-reason-summary-service.test.ts src/server/validators/authorization-window-reason-summary.test.ts src/server/services/authorization-context-reason-summary-service.test.ts src/server/validators/authorization-context-reason-summary.test.ts src/server/services/authorization-source-reason-summary-service.test.ts src/server/validators/authorization-source-reason-summary.test.ts src/server/services/authorization-access-reason-summary-service.test.ts src/server/validators/authorization-access-reason-summary.test.ts`
- `git diff --check`
- scoped `prettier --write` for Batch 96 source, tests, task plan, evidence, audit review, and state files
- scoped `prettier --check` for the same file list
- required anchor check for `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, `reason_summary_only`, `redacted`, `redacted_reference`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
