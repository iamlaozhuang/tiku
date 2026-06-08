# Batch 95 Authorization Display Local Contract Plan

**Batch id:** `authorization-display-local-contract-batch`

**Branch:** `codex/batch-95-authorization-display-local-contract`

**Task kind:** `implementation`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Batch 94 task plan, rollup evidence, audit review, and local authorization read-model contracts

## Batch Module Boundary

This batch is limited to local-only `authorization` display read-model and service-contract logic. It may summarize local display metadata for time windows, source audiences, redacted evidence references, and an aggregate display contract.

The module returns service-layer `{ code, message, data }` responses only. It must not enforce, grant, revoke, deny, or reinterpret real `authorization` permission behavior.

Allowed files:

- `src/server/models/authorization-window-summary.ts`
- `src/server/contracts/authorization-window-summary-contract.ts`
- `src/server/validators/authorization-window-summary.ts`
- `src/server/validators/authorization-window-summary.test.ts`
- `src/server/services/authorization-window-summary-service.ts`
- `src/server/services/authorization-window-summary-service.test.ts`
- `src/server/models/authorization-audience-summary.ts`
- `src/server/contracts/authorization-audience-summary-contract.ts`
- `src/server/validators/authorization-audience-summary.ts`
- `src/server/validators/authorization-audience-summary.test.ts`
- `src/server/services/authorization-audience-summary-service.ts`
- `src/server/services/authorization-audience-summary-service.test.ts`
- `src/server/models/authorization-evidence-reference-summary.ts`
- `src/server/contracts/authorization-evidence-reference-summary-contract.ts`
- `src/server/validators/authorization-evidence-reference-summary.ts`
- `src/server/validators/authorization-evidence-reference-summary.test.ts`
- `src/server/services/authorization-evidence-reference-summary-service.ts`
- `src/server/services/authorization-evidence-reference-summary-service.test.ts`
- `src/server/models/authorization-display-summary.ts`
- `src/server/contracts/authorization-display-summary-contract.ts`
- `src/server/validators/authorization-display-summary.ts`
- `src/server/validators/authorization-display-summary.test.ts`
- `src/server/services/authorization-display-summary-service.ts`
- `src/server/services/authorization-display-summary-service.test.ts`
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

1. `authorization-window-summary`
   - Add a local display-only read-model for `authorization` time-window metadata.
   - Focused tests:
     - maps valid starts/expires/current timestamps to display-only window metadata;
     - supports missing `expiresAt` as an open display window;
     - rejects invalid timestamps without returning DB rows, numeric `id`, or sensitive data.
   - Commit scope: window-summary model, contract, validator, service, and focused tests.

2. `authorization-audience-summary`
   - Add a local display-only audience summary for `personal_auth` and `org_auth` references.
   - Focused tests:
     - summarizes personal and organization source counts;
     - keeps `organizationPublicId` as a public reference only;
     - rejects invalid `authorization` source input without adding role, permission, or quota rules.
   - Commit scope: audience-summary model, contract, validator, service, and focused tests.

3. `authorization-evidence-reference-summary`
   - Add a local redacted evidence reference summary for `redeem_code`, `audit_log`, and `ai_call_log`.
   - Focused tests:
     - returns only redacted reference statuses;
     - preserves `null` for missing optional references;
     - does not return plaintext `redeem_code`, raw `audit_log`, raw `ai_call_log`, prompt text, provider payload, or generated AI content.
   - Commit scope: evidence-reference-summary model, contract, validator, service, and focused tests.

4. `authorization-display-summary`
   - Add an aggregate local display contract that combines Batch 95 summaries with `paper` and `mock_exam` as context only.
   - Focused tests:
     - builds an aggregate display-only contract from local summary inputs;
     - keeps `paper` and `mock_exam` as display context only;
     - rejects inconsistent user or selected `authorization` references.
   - Commit scope: display-summary model, contract, validator, service, and focused tests.

## TDD Process

Each subtask must follow RED -> GREEN -> focused verification:

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
- `npm.cmd run test:unit -- src/server/services/authorization-window-summary-service.test.ts src/server/validators/authorization-window-summary.test.ts src/server/services/authorization-audience-summary-service.test.ts src/server/validators/authorization-audience-summary.test.ts src/server/services/authorization-evidence-reference-summary-service.test.ts src/server/validators/authorization-evidence-reference-summary.test.ts src/server/services/authorization-display-summary-service.test.ts src/server/validators/authorization-display-summary.test.ts`
- `git diff --check`
- scoped Prettier check for Batch 95 source, tests, task plan, evidence, audit review, and state files
- required anchor check for `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, `display_only`, `redacted`, `redacted_reference`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
