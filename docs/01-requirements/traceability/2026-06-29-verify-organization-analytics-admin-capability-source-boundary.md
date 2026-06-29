# Traceability: Verify Organization Analytics Admin Capability Source Boundary

- Task id: `verify-organization-analytics-admin-capability-source-boundary-2026-06-29`
- Source story: `seeded_by_security_permission_role_boundary_inventory_2026_06_29`
- Finding id: `role-inv-002`
- Branch: `codex/org-analytics-capability-boundary-20260629`
- Scope: verification-only organization analytics authorization source boundary review.

## Requirement Mapping

| Requirement                                                                                                | Verification Surface                                                                                                        | Status     |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Prove organization analytics advanced access cannot bypass service-computed organization capability.       | `src/server/services/organization-analytics-route.ts`, `src/server/services/organization-analytics-service.ts`              | not proven |
| Confirm repository-visible organization scope remains enforced before aggregate analytics reads.           | Organization analytics service repository-backed summary builders                                                           | covered    |
| Confirm focused existing tests cover standard-admin rejection, route wiring, redaction, and visible scope. | `src/server/services/organization-analytics-route.test.ts`, `tests/unit/organization-analytics-admin-entry-surface.test.ts` | partial    |
| Keep current task verification-only.                                                                       | Git diff, evidence, and Module Run v2 validation                                                                            | pending    |
| Preserve DB, Provider/AI, browser/dev server, release, dependency, sensitive evidence, and Cost gates.     | Task state, evidence, audit, and acceptance                                                                                 | pending    |

## Boundary Matrix

| Area                             | Redacted Observation                                                                                                                                                         | Decision                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Runtime role gate                | The route admits analytics runtime context only for privileged organization analytics roles.                                                                                 | covered with watch                                    |
| Capability source                | The route synthesizes advanced organization analytics context from session role and route query rather than directly consuming service-computed workspace capability source. | finding confirmed                                     |
| Service base access              | The service requires advanced edition, organization authorization source, training-summary permission, and organization match.                                               | covered                                               |
| Visible organization scope       | Repository-backed reads first resolve visible organization scope by admin and reject when requested organization is not included.                                            | covered                                               |
| Existing focused tests           | Existing tests cover standard organization admin rejection, route/runtime wiring, response redaction, and visible-scope routing.                                             | pass with coverage gap for capability-source mismatch |
| Source/test repair authorization | Current task has no source/test repair approval.                                                                                                                             | repair task seeded, implementation blocked            |

## Finding

| Finding        | Severity | Verdict                                                                                | Evidence Summary                                                                                                                                                     | Follow-up Task                                                        |
| -------------- | -------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `role-inv-002` | medium   | `confirmed_capability_source_mismatch_needs_repair_pending_fresh_source_test_approval` | Cross-organization visible-scope guard is present, but the route does not prove that advanced analytics capability came from the service-computed capability source. | `repair-organization-analytics-capability-source-boundary-2026-06-29` |

## Non-Actions

- No source or test file was changed.
- No DB connection, mutation, schema, migration, seed, or raw row access was performed.
- No Provider/AI call, Provider/model configuration, prompt, payload, raw AI input/output, browser runtime, dev server, raw DOM, screenshot, trace, release readiness, final Pass, deployment, PR, force-push, package/lockfile change, or Cost Calibration was performed.
- Sensitive evidence was not recorded.

## Next Task Guidance

Highest-priority confirmed repair remains `repair-session-login-response-credential-boundary-2026-06-29` if fresh source/test approval is granted. For this specific medium finding, the follow-up repair task is `repair-organization-analytics-capability-source-boundary-2026-06-29`.
