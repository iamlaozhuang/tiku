# Module Run v2 Local Experience Acceptance Planning Task Plan

## Task

- Task id: `module-run-v2-local-experience-acceptance-planning`
- Task kind: `local_verification_planning`
- Dependency: `module-run-v2-ai-task-and-provider-planning`
- Goal: produce a proposal-only acceptance bridge plan for moving approved modules from local contracts toward local
  API/Server Action, UI/browser, role-flow, and e2e-ready verification.

## Scope

Allowed:

- Read Module Run v2 matrix, project state, task queue, and latest planning/evidence.
- Draft local experience acceptance chains and future task candidates.
- Identify which future tasks would need explicit approval for API, UI, browser, role-flow, or e2e surfaces.
- Update planning logs and governance state only.

Blocked:

- Product implementation.
- Creating or editing tests/e2e.
- Provider calls or provider configuration.
- Env/secret reading or changes.
- Staging/prod/cloud/deploy, payment, external-service work.
- Dependency, package, lockfile, schema, migration, `src/db/schema/**`, and `drizzle/**`.
- Cost Calibration Gate execution.

## Validation

- `git diff --check`
- scoped prettier check for changed planning docs/state files
- required anchor check for `localExperienceClosureGate`, `localFullLoopGate`, `e2e`, and
  `Cost Calibration Gate remains blocked`

## Acceptance Bridge Plan

Target chain: `personal-learning-ai-experience`.

Current localFullLoopGate state:

- `authorization-and-access` provides local redacted context and display-selector foundations.
- `ai-task-and-provider` planning has seeded L2 provider-agnostic lifecycle work.
- L5/L6 local closure remains blocked until a later task explicitly approves bridge surfaces.

Future bridge sequence:

1. `module-run-v2-personal-ai-local-transport-contract-planning`
   - Target: L4 `local_api_or_server_action_contract`.
   - Purpose: plan the REST API or Server Action boundary for a redacted personal AI task result reference.
   - Requires `localExperienceAcceptanceBridgeApproved` before touching `src/app/api/v1/**`, Server Actions,
     repositories, or mappers.
2. `module-run-v2-personal-ai-local-ui-browser-planning`
   - Target: L5 `local_ui_browser`.
   - Purpose: plan the student-visible local browser path for request and result-reference inspection.
   - Requires `localExperienceAcceptanceBridgeApproved` before touching `src/app/(student)/**` or running browser
     verification.
3. `module-run-v2-cross-role-local-flow-planning`
   - Target: L6 `role_flow`.
   - Purpose: plan cross-role denial, redaction, and local role-flow evidence for student/admin/ops boundaries.
   - Requires `localExperienceAcceptanceBridgeApproved` before touching role-flow implementation or `e2e/**`.

Not approved by this task:

- API, Server Action, repository, mapper, UI, browser, role-flow, or e2e implementation.
- Provider calls/configuration, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, or
  migration work.

## Stop Conditions

Stop immediately if acceptance planning would require implementation, e2e file changes, provider/env/secret/deploy,
payment, external-service, dependency, schema/migration, or Cost Calibration Gate execution.
