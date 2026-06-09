# Module Run v2 AI Task And Provider Planning Task Plan

## Task

- Task id: `module-run-v2-ai-task-and-provider-planning`
- Task kind: `implementation_planning`
- Execution module candidate: `ai-task-and-provider`
- Dependency: `module-run-v2-autopilot-maturity-hardening`
- Branch: `codex/module-run-v2-ai-task-provider-planning`
- Goal: prepare the next Module Run v2 plan for provider-agnostic AI task lifecycle work and seed only low-risk local
  implementation work when `implementationAutoSeedGate` passes.

## Recovery And Readiness

- Startup readiness passed with `startupDecision: prepare_next_task`.
- Closeout recovery dry-run autopilot returned `autopilotDecision: continue_current_thread`.
- Unattended readiness for this task returned `unattendedStopDecision: continue`.
- Pre-edit readiness initially found `HARD_BLOCK_MISSING_TASK_PLAN_PATH`; the queue metadata repair added the concrete
  plan path and the concrete allowed task-plan file.
- Pre-edit readiness then passed for the planning files and seeded task placeholder files.

## nextModuleRunCandidate Decision

`ai-task-and-provider` remains the correct `nextModuleRunCandidate`.

Reasons:

- `authorization-and-access` has already established local redacted `authorization`, `personal_auth`, `org_auth`,
  `redeem_code`, `audit_log`, and `ai_call_log` reference patterns.
- `personal-learning-ai`, `organization-training`, and `ops-governance-and-retention` all depend on
  `ai-task-and-provider` for a provider-agnostic lifecycle before they can claim higher local experience closure.
- Existing code already has a minimal `ai-task-domain` read model; the next safe Batch should extend that local contract
  instead of jumping to repository, API, UI, provider, schema, or e2e surfaces.

## localExperienceClosureGate

- Target experience chain: `personal-learning-ai-experience`.
- Current localFullLoopGate level: L2-ready local contract and unit-test surface.
- Target localFullLoopGate level for this seeded implementation: L2.
- Acceptance bridge needed: yes, but not in the seeded task. API, Server Action, UI/browser, role-flow, and e2e bridge
  work require a later `localExperienceAcceptanceBridgeApproved` task.
- User-visible surface needed: not for this Batch. The seeded task only strengthens the service contract that later
  user-visible flows will consume.
- Blocked remainder: L5/L6 local closure remains blocked until a future acceptance bridge task is approved.

## Candidate Batches

1. `module-run-v2-ai-task-lifecycle-local-contract`
   - Purpose: extend the existing local `ai-task-domain` contract with provider-agnostic lifecycle, redacted context,
     and deterministic local validation.
   - localFullLoopGate: L2.
   - Surfaces: `src/server/contracts/**`, `src/server/models/**`, `src/server/validators/**`, `src/server/services/**`,
     same-directory focused tests, and governance logs.
   - Seeded now: yes, with `autoDriveLocalImplementationApproval`.
2. Future local audit/reference Batch
   - Purpose: connect lifecycle output to existing redacted `audit_log` and `ai_call_log` reference contracts.
   - Seeded now: no. It should wait until Batch 1 lands.
3. Future local provider sandbox proposal
   - Purpose: document a local-only sandbox call policy.
   - Seeded now: no. Any actual local provider sandbox call still needs explicit user approval.

## implementationAutoSeedGate

Seeded implementation task:

- seededImplementationTask: `module-run-v2-ai-task-lifecycle-local-contract`
- autoDriveLocalImplementationApproval: recorded in `task-queue.yaml`.
- focused tests:
  - `npm.cmd run test:unit -- src/server/validators/ai-task-domain.test.ts src/server/services/ai-task-domain-service.test.ts`
- localFullLoopGate: L2.
- Bridge approval: not used; no bridge surfaces are included.

## Stop Conditions

Stop immediately if the work needs provider calls, provider configuration, env/secret access, staging/prod/cloud/deploy,
payment, external-service work, dependency/package/lockfile changes, schema/migration work, repository/API/UI/e2e bridge
surfaces without approval, or Cost Calibration Gate execution.

Cost Calibration Gate remains blocked.
