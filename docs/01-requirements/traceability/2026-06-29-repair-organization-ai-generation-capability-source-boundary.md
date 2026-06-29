# Repair Organization AI Generation Capability Source Boundary Traceability

## Scope

- Task id: `repair-organization-ai-generation-capability-source-boundary-2026-06-29`
- Finding id: `role-inv-003`
- Branch: `codex/org-ai-generation-capability-repair-20260629`
- Scope: local source/test repair for organization AI generation local-contract authorization source.

## Requirement Alignment

| Requirement                                                                                                        | Implementation / Evidence                                                                                                                                                                                                                                                                          | Status   |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Organization AI generation access must derive from service-computed organization capability metadata.              | `src/server/services/admin-ai-generation-local-contract-route.ts` validates `adminWorkspaceCapability` with `capabilitySource: service_computed`, `organizationAuthorizationSource: org_auth`, advanced edition, non-null organization public id, and `canUseOrganizationAdvancedWorkspace: true`. | repaired |
| Route must not synthesize organization AI generation access from role plus session organization context.           | Organization owner/history scope now resolves from service-computed capability metadata; the actor model no longer carries a separate session-level organization public id.                                                                                                                        | repaired |
| Provider-disabled local-contract behavior must be preserved.                                                       | Focused route tests still cover Provider-disabled summaries and local contract response mapping.                                                                                                                                                                                                   | pass     |
| Role-present sessions without valid service-computed capability must be denied before task/history repository use. | Added POST missing-capability and GET false-capability regression tests with repository call assertions.                                                                                                                                                                                           | pass     |
| No prohibited boundary actions may be executed.                                                                    | No DB connection/mutation, no real Provider call/configuration, no browser/dev server, no package/lockfile change, no release readiness/final Pass/Cost Calibration.                                                                                                                               | pass     |

## Validation Mapping

| Validation                                             | Result                   |
| ------------------------------------------------------ | ------------------------ |
| Focused Vitest for route and entry surface             | pass: 2 files, 35 tests  |
| TypeScript typecheck                                   | pass                     |
| Scoped formatting, diff check, and Module Run v2 gates | pending final validation |

## Follow-Up

- Continue with the next queued smallest local security repair only after its own allowedFiles, blockedFiles, boundaries, validation commands, and closeout policy are materialized.
