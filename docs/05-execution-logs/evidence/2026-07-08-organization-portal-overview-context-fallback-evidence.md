# 2026-07-08 organization portal overview context fallback evidence

## Scope

- Task id: `organization-portal-overview-context-fallback-2026-07-08`
- Branch: `codex/organization-portal-overview-context-fallback`
- Scope: organization portal readonly overview route context fallback only.
- Browser/runtime: not executed in this task.
- DB/env/provider/schema/dependency: not executed or changed.

## Root Cause Evidence

- Local endpoint existed and returned the organization portal overview admin-context unavailable business response when no usable context was accepted.
- Source review found `/organization/portal` page access allowed a valid organization-admin role with organization context, while the new overview API required a service-computed `org_auth` capability summary before reading the readonly overview.
- This mismatch caused the frontend to render `组织后台加载失败` after the overview request failed.

## Requirement Mapping Result

- `2026-06-24-role-separated-mvp-requirement-alignment.md`: `org_standard_admin` and `org_advanced_admin` both require organization-scoped roster/status and authorization/status visibility.
- `role-experience-fulfillment-matrix.md`: organization admins share a portal/status surface; advanced-only organization AI/training remains separate and gated.
- `CT-REQ-010`, `CT-REQ-050`, `CT-REQ-054`: employee and authorization writes remain platform-owned; organization admins receive read-only status surfaces.
- `CT-REQ-055` and ADR-007: fallback must not grant advanced-only capabilities without service-computed effective edition.

## TDD Evidence

- Red test added: organization admin with organization context but missing `adminWorkspaceCapability` should reach the readonly overview reader.
- Initial red run:
  - Command: `npm.cmd exec -- vitest run src/server/services/organization-portal-overview-route.test.ts`
  - Result: failed as expected.
  - Failure category: received business code `403189` where success was expected.

## Validation

| Check                               | Command                                                                                                                                                                                                      | Result                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| Targeted portal unit                | `npm.cmd exec -- vitest run src/server/services/organization-portal-overview-route.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts`                                                       | Pass, 2 files, 9 tests  |
| Adjacent organization boundary unit | `npm.cmd exec -- vitest run tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts`                      | Pass, 3 files, 21 tests |
| Lint                                | `npm.cmd run lint`                                                                                                                                                                                           | Pass                    |
| Typecheck                           | `npm.cmd run typecheck`                                                                                                                                                                                      | Pass                    |
| Prettier touched files              | `npm.cmd exec -- prettier --check --ignore-unknown <touched files>`                                                                                                                                          | Pass                    |
| Diff whitespace                     | `git diff --check`                                                                                                                                                                                           | Pass                    |
| Module Run v2 precommit             | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-portal-overview-context-fallback-2026-07-08`                     | Pass                    |
| Module Run v2 prepush               | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-portal-overview-context-fallback-2026-07-08 -SkipRemoteAheadCheck` | Pass                    |

## Boundary Confirmation

- Source files changed: organization portal overview route and route tests only.
- Governance files changed: project state, task queue, task plan, evidence, audit.
- No package or lockfile changes.
- No DB schema, migration, seed, or fixture changes.
- No Provider call.
- No env, credential, session, cookie, token, localStorage, DB URL, raw DB row, internal numeric id, Provider payload, raw prompt, raw AI output, full question, paper, material, or resource content was recorded.
- Fallback behavior is limited to readonly portal overview.
- Advanced-only training, analytics, and organization AI access still requires the existing service-computed advanced capability guards.
