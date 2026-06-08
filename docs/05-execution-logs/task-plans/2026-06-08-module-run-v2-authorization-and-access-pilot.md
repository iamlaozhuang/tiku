# Module Run v2 Authorization And Access Pilot Plan

## Scope

- task id: `module-run-v2-authorization-and-access-pilot`
- execution module: `authorization-and-access`
- branch: `codex/module-run-v2-authorization-and-access-pilot`
- base branch: `master`
- base SHA: `8c715d55729126575e8ebf9fd10ff683c7cbc98f`
- automation mode: `local_auto_candidate`
- Module Run v2 status: first business pilot
- Cost Calibration Gate remains blocked and must not be executed.

## Recovery Audit

Read before business logic:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Batch 94-100 task plans, evidence, and audit reviews
- latest Module Run v2 hook/automation hardening plans, evidence, and audit reviews

Baseline conclusion:

- Batch 94-100 are completed historical baseline and must not be reimplemented.
- Batch 100 leaves `authorization-and-access` at `local_selector_only`.
- This Module Run starts at Batch 101.
- No dependency, package, lockfile, schema, migration, repository, real API route, real Server Action, provider,
  env/secret, staging/prod/cloud/deploy, payment, external-service, or Cost Calibration Gate work is approved.
- No real authorization permission model, role, permission, quota, entitlement, or enforcement behavior may change.

## Module Run Target

Advance `authorization-and-access` from local selector contracts toward L4 local API or Server Action contract proof using
service-layer-only contracts and focused unit tests.

This pilot intentionally keeps all work local:

- `paper` and `mock_exam` remain context only.
- `redeem_code`, `audit_log`, and `ai_call_log` remain redacted references only.
- output must not return DB rows or expose auto-increment `id` values.
- no AI content may be generated, saved, or called.

## Batch Plan

### Batch 101: Authorization Reason Selector API Contract

- batch goal: define a local API contract DTO for Batch 100 selector summary output.
- focused test target:
  - accepts a `local_selector_only` selector summary and returns a standard `{ code, message, data }` envelope;
  - records `/api/v1/authorizations/{authorizationPublicId}/preview-reason-selector` as a local contract path only;
  - rejects authorization public id mismatches and strips numeric `id`, plaintext `redeem_code`, raw `audit_log`, and raw
    `ai_call_log`.
- allowed files:
  - `src/server/models/authorization-reason-selector-api-contract.ts`
  - `src/server/contracts/authorization-reason-selector-api-contract-contract.ts`
  - `src/server/validators/authorization-reason-selector-api-contract.ts`
  - `src/server/validators/authorization-reason-selector-api-contract.test.ts`
  - `src/server/services/authorization-reason-selector-api-contract-service.ts`
  - `src/server/services/authorization-reason-selector-api-contract-service.test.ts`
- blocked files:
  - `package.json`, lockfiles, `src/db/schema/**`, `drizzle/**`, `.env.local`, `.env.example`, `e2e/**`
  - repository, real API route under `src/app/api/**`, real Server Action, provider, env/secret, staging/prod/cloud/deploy,
    payment, external-service files
- stop conditions:
  - needs DB/repository access or real route registration;
  - needs permission-model, role, permission, quota, entitlement, or enforcement changes;
  - needs unredacted evidence or Cost Calibration Gate execution.
- localFullLoopGate target: `L4 local_api_or_server_action_contract`.

### Batch 102: Authorization Reason Selector Route Contract

- batch goal: add a service-layer route-handler contract that validates request JSON and path public id before calling the
  Batch 101 local API contract service.
- focused test target:
  - returns the Batch 101 standard API response for `POST`-style local contract input;
  - returns standard unauthorized response when user context is missing;
  - rejects path/body authorization public id mismatch without returning DB row or numeric `id`.
- allowed files:
  - `src/server/services/authorization-reason-selector-route.ts`
  - `src/server/services/authorization-reason-selector-route.test.ts`
- blocked files:
  - `src/app/api/**`, repository files, package/lockfiles, schema/migration, env/secret, e2e, provider/deploy/payment files
- stop conditions:
  - needs actual route registration, database lookup, real permission enforcement, or provider/env access.
- localFullLoopGate target: `L4 local_api_or_server_action_contract`.

### Batch 103: Authorization Reason Selector Server Action Contract

- batch goal: add a service-layer Server Action contract wrapper for the same selector summary without creating a real
  Next.js action export.
- focused test target:
  - accepts user context plus selector summary and returns `local_server_action_contract_only`;
  - preserves `paper` / `mock_exam` context and redacted `redeem_code`, `audit_log`, `ai_call_log` references from selector
    output only;
  - rejects user or authorization public id mismatches and never returns numeric `id` or sensitive fields.
- allowed files:
  - `src/server/models/authorization-reason-selector-action-contract.ts`
  - `src/server/contracts/authorization-reason-selector-action-contract-contract.ts`
  - `src/server/validators/authorization-reason-selector-action-contract.ts`
  - `src/server/validators/authorization-reason-selector-action-contract.test.ts`
  - `src/server/services/authorization-reason-selector-action-contract-service.ts`
  - `src/server/services/authorization-reason-selector-action-contract-service.test.ts`
- blocked files:
  - real Server Action exports, UI files, `src/app/**`, repository files, package/lockfiles, schema/migration, env/secret,
    e2e, provider/deploy/payment files
- stop conditions:
  - needs real Server Action wiring, permission enforcement, DB/repository work, provider/env access, or unredacted evidence.
- localFullLoopGate target: `L4 local_api_or_server_action_contract`.

## TDD Rule

Each Batch must follow RED -> GREEN:

1. Write focused unit tests first.
2. Run the focused tests and confirm RED for missing module or missing behavior.
3. Implement the smallest local logic needed to pass.
4. Re-run the focused tests and confirm GREEN.
5. Commit the Batch independently.

## Module Validation

After all planned Batches:

- pre-edit advisory for changed/planned files
- focused unit tests for Batch 101-103 files
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped `prettier --write`
- scoped `prettier --check`
- required anchor check for Module Run v2, `authorization`, `personal_auth`, `org_auth`, `paper`, `mock_exam`,
  `redeem_code`, `audit_log`, `ai_call_log`, `local_api_contract_only`, `local_server_action_contract_only`,
  `redacted_reference`, `threadRolloverGate`, `nextModuleRunCandidate`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-authorization-and-access-pilot`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Thread Rollover

This Module Run contains 3 Batches, so it may continue in the current thread if Git state, scope, and evidence remain
clear. Module Run closeout must recommend a new thread before entering the next execution module.

## Next Module Candidate

Closeout evidence must include `nextModuleRunCandidate`. Default recommendation to evaluate after this Module Run:
`ai-task-and-provider`, proposal only, no cross-module implementation in this branch.
