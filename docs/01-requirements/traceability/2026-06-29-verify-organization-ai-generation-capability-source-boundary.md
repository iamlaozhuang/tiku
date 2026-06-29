# Traceability: Verify Organization AI Generation Capability Source Boundary

- Task id: `verify-organization-ai-generation-capability-source-boundary-2026-06-29`
- Source story: `seeded_by_security_permission_role_boundary_inventory_2026_06_29`
- Finding id: `role-inv-003`
- Branch: `codex/org-ai-generation-capability-boundary-20260629`
- Scope: verification-only organization AI generation authorization source boundary review.

## Requirement Mapping

| Requirement                                                                                                                                     | Verification Surface                                                                                                      | Status     |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Prove organization AI generation local contract cannot bypass service-computed organization capability.                                         | `src/server/services/admin-ai-generation-local-contract-route.ts`                                                         | not proven |
| Confirm default local contract path keeps Provider execution blocked under current task boundary.                                               | `src/server/services/admin-ai-generation-local-contract-route.ts`, focused existing tests                                 | covered    |
| Confirm standard organization admins are denied before local-contract task creation or history listing.                                         | `src/server/services/admin-ai-generation-local-contract-route.test.ts`, `tests/unit/admin-ai-generation-entry-surface.ts` | covered    |
| Keep real Provider execution outside this verification task while allowing local pure fake Provider unit tests under centralized authorization. | Focused Vitest command and evidence redaction rules                                                                       | covered    |
| Preserve DB, real Provider/AI, browser/dev server, release, dependency, sensitive evidence, and Cost gates.                                     | Task state, evidence, audit, acceptance, and Module Run v2 closeout                                                       | pending    |

## Boundary Matrix

| Area                             | Redacted Observation                                                                                                                                                                                   | Decision                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Runtime role gate                | The route admits organization AI generation when an actor has `org_advanced_admin` or `super_admin` plus organization binding.                                                                         | covered with watch                         |
| Capability source                | The route does not consume `adminWorkspaceCapability` or `capabilitySource`; organization policy input is synthesized locally with advanced org authorization facts.                                   | finding confirmed                          |
| Provider boundary                | Default local contract read model keeps Provider call, env secret access, Provider configuration read, and Cost Calibration blocked.                                                                   | covered                                    |
| Fake Provider local simulation   | Existing tests contain a local fake Provider branch; centralized authorization allows pure local fake Provider unit tests without network, real Provider config, env/secrets, or raw payload evidence. | allowed as local simulation only           |
| Existing focused tests           | Existing tests cover provider-disabled defaults, organization standard admin denial, redacted summaries, and organization-owned draft scoping.                                                         | pass with capability-source coverage gap   |
| Source/test repair authorization | Centralized local security repair-loop authorization exists, but current task remains verification-only and does not materialize source/test repair files for this specific finding.                   | repair task seeded, implementation pending |

## Finding

| Finding        | Severity | Verdict                                                                          | Evidence Summary                                                                                                                                                   | Follow-up Task                                                            |
| -------------- | -------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `role-inv-003` | medium   | `confirmed_capability_source_mismatch_needs_repair_pending_task_materialization` | Provider-disabled local contract behavior is covered, but backend organization AI generation access is not proven to derive from service-computed capability data. | `repair-organization-ai-generation-capability-source-boundary-2026-06-29` |

## Non-Actions

- No source or test file was changed.
- No DB connection, mutation, schema, migration, seed, or raw row access was performed.
- No real Provider execution, Provider configuration, env/secret read, or raw Provider payload evidence was performed. Local fake Provider unit tests may run under centralized authorization.
- No real Provider/AI call, Provider/model configuration, prompt, payload, raw AI input/output, browser runtime, dev server, raw DOM, screenshot, trace, release readiness, final Pass, deployment, PR, force-push, package/lockfile change, or Cost Calibration was performed.
- Sensitive evidence was not recorded.

## Next Task Guidance

Highest-priority confirmed repair is `repair-session-login-response-credential-boundary-2026-06-29` under the centralized local security repair-loop authorization, after that task materializes allowedFiles/blockedFiles and validation in its own task plan. The new follow-up for this specific medium finding is `repair-organization-ai-generation-capability-source-boundary-2026-06-29`.
