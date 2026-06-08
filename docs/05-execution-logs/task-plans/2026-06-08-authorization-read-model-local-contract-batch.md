# Batch 94 Authorization Read Model Local Contract Plan

**Batch id:** `authorization-read-model-local-contract-batch`

**Branch:** `codex/batch-94-authorization-read-model-local-contract`

**Task kind:** `implementation`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Phase 91-93 task plans, evidence, and audit reviews
- Existing local `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, and `ai_call_log` read-model contracts

## Batch Module Boundary

This batch is limited to local-only `authorization` read-model and service-contract logic. It may normalize public references, summarize local source/context state, and return standard `{ code, message, data }` envelopes for service-layer consumers.

Allowed files:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- corresponding `*.test.ts`
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

1. `authorization-source-summary`
   - Add a local read-model for `personal_auth` / `org_auth` source candidates.
   - Focused tests:
     - builds a redacted source summary from public references;
     - rejects invalid `authorization` source input;
     - does not return numeric `id`, plaintext `redeem_code`, token, secret, or DB row payloads.
   - Commit scope: source-summary model, contract, validator, service, and focused tests.

2. `authorization-scope-summary`
   - Add a local `paper` / `mock_exam` scope context summary for one `authorization` reference.
   - Focused tests:
     - builds scope-only context for matching `paper` and `mock_exam` references;
     - reports context mismatch as read-model metadata only;
     - rejects invalid `authorization`, `paper`, or `mock_exam` context input.
   - Commit scope: scope-summary model, contract, validator, service, and focused tests.

3. `authorization-local-contract-summary`
   - Add an aggregate local contract that combines source and scope summaries with redacted `redeem_code`, `audit_log`, and `ai_call_log` references.
   - Focused tests:
     - builds the aggregate contract without database rows or sensitive evidence;
     - keeps `paper` and `mock_exam` as scope/context only;
     - rejects missing user or empty source list input.
   - Commit scope: aggregate model, contract, validator, service, and focused tests.

## TDD Process

Each subtask must follow RED -> GREEN -> focused verification:

1. Write the focused unit tests first.
2. Run the subtask focused test command and confirm RED for missing module or missing behavior.
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
- `npm.cmd run test:unit -- src/server/services/authorization-source-summary-service.test.ts src/server/validators/authorization-source-summary.test.ts src/server/services/authorization-scope-summary-service.test.ts src/server/validators/authorization-scope-summary.test.ts src/server/services/authorization-local-contract-summary-service.test.ts src/server/validators/authorization-local-contract-summary.test.ts`
- `git diff --check`
- scoped Prettier check for Batch 94 source, tests, task plan, evidence, audit review, and state files
- required anchor check for `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, `scope_only`, `local_contract_only`, `redacted`, `redacted_reference`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
