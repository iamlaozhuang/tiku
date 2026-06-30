# Traceability: Repair Organization Training Capability Source Boundary

- Task id: `repair-organization-training-capability-source-boundary-2026-06-29`
- Branch: `codex/org-training-capability-repair-20260629`
- Finding id: `unit-b-auth-role-001`
- Base commit: `e05bc0681e5fc3e41a75292507c8ffa02f1ae303`
- Scope: focused source/test repair for organization training runtime admin capability-source boundary.

## Requirement Mapping

| Requirement                                                                                                      | Verification Surface                                                                       | Status   |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------- |
| Materialize fresh approval, allowed files, blocked files, boundaries, validation, evidence, and closeout policy. | `project-state.yaml`, `task-queue.yaml`, and task plan.                                    | complete |
| Prove the suspected boundary drift is reachable before production fix.                                           | RED tests in `organization-training-route.test.ts`.                                        | complete |
| Require service-computed organization capability before training management repository operations.               | `createSessionBackedOrganizationAdminContextResolver` in `organization-training-route.ts`. | complete |
| Preserve legitimate advanced organization admin behavior.                                                        | Existing organization training route tests with valid capability fixture.                  | complete |
| Keep DB, Provider/AI, browser/e2e, dependency, staging/prod/deploy, release readiness, final Pass blocked.       | Redacted evidence, audit review, and Module Run v2 validation.                             | complete |

## Repair Matrix

| Surface                              | Before                                                                                   | After                                                                                                           | Status    |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------- |
| Runtime organization admin role gate | `super_admin` or `org_advanced_admin` role plus visible organization scope.              | Same role gate plus service-computed `org_auth` advanced organization workspace capability.                     | repaired  |
| Missing capability summary           | Advanced role session could reach visible-scope and lineage-backed publish path.         | Missing capability summary returns admin-context-unavailable before visible-scope and lineage calls.            | repaired  |
| False capability summary             | Advanced role session with false advanced-workspace capability could reach publish path. | False capability returns admin-context-unavailable before visible-scope, lineage, and publish repository calls. | repaired  |
| Employee training path               | Employee user type and effective org authorization context gate.                         | Not changed.                                                                                                    | unchanged |

## Boundary Confirmation

This task did not authorize or perform release readiness, final Pass, Cost Calibration, staging/prod/cloud/deploy, DB,
Provider/AI, browser/e2e, dependency, package, lockfile, PR, or force-push work.
