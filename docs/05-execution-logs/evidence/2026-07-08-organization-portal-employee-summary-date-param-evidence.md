# 2026-07-08 Organization Portal Employee Summary Date Param Evidence

## Scope

- Task id: `organization-portal-employee-summary-date-param-2026-07-08`
- Branch: `codex/organization-portal-employee-summary-date-param`
- Scope: minimal repository Date parameter fix for organization portal readonly overview employee locked-count summary.
- Explicit non-scope: no DB/schema/migration/seed/fixture changes, no Provider execution, no dependency changes, no organization write flows, no training/AI feature work, no authorization semantic changes.

## Root Cause

- Localhost 0704 organization admin session and organization context were valid.
- `GET /api/v1/organization-portal-overviews` failed with HTTP 500 and standard error envelope before the fix.
- Isolated read-only reproduction narrowed the failure to the employee summary aggregation query.
- Root cause category: a Drizzle raw SQL fragment passed a JavaScript `Date` directly to the postgres driver for the locked employee comparison; that driver path rejects the unencoded `Date` parameter.
- Fix category: pass an ISO timestamp string and cast it in SQL as `timestamptz` for this comparison only.

## Requirement Mapping Result

| Source                                                                                          | Mapping                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/01-requirements/00-index.md`                                                              | Organization admin workspaces are a role-separated backend surface; this evidence records a runtime repair only, not release readiness.                  |
| `docs/01-requirements/advanced-edition/00-index.md`                                             | Advanced organization admins keep their organization workspace; this fix does not change advanced feature visibility or entitlement calculation.         |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` and ADR-007 | `effectiveEdition` remains service-computed; no source `edition`, `org_auth`, or upgrade semantics were changed.                                         |
| `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`      | Organization admins may view scoped employee roster/status and authorization/status; no employee or authorization write authority is introduced.         |
| `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`                       | Restores the organization portal surface loading path while retaining the broader role matrix release-blocked status until fresh full-role verification. |
| `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`       | The portal remains readonly and organization-scoped; platform-owned operations remain outside this task.                                                 |
| `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`    | This is not a broad UI/UX implementation; it fixes a runtime data-loading defect under the existing organization workspace.                              |

## Validation Evidence

| Check                  | Result                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TDD red                | New focused Date-parameter regression failed before the source fix as expected.                                                                                                                               |
| Focused portal unit    | `npm.cmd exec -- vitest run src/server/services/organization-portal-overview-route.test.ts` passed with 6 tests.                                                                                              |
| Adjacent portal unit   | `npm.cmd exec -- vitest run src/server/services/organization-portal-overview-route.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts` passed with 10 tests.                                  |
| Admin boundary unit    | `npm.cmd exec -- vitest run tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts` passed with 21 tests. |
| Lint                   | `npm.cmd run lint` passed.                                                                                                                                                                                    |
| Typecheck              | `npm.cmd run typecheck` passed.                                                                                                                                                                               |
| Scoped prettier check  | Touched file prettier check passed after scoped formatting.                                                                                                                                                   |
| Diff check             | `git diff --check` passed.                                                                                                                                                                                    |
| Module Run pre-commit  | `Test-ModuleRunV2PreCommitHardening.ps1` passed for this task id.                                                                                                                                             |
| Module Run pre-push    | `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck` passed after repository checkpoint alignment.                                                                                                    |
| Localhost 0704 runtime | After fix, organization portal overview API returned HTTP 200 with standard success envelope and the page no longer showed the load-failure state.                                                            |

## Redaction And Safety

- No credentials, sessions, cookies, tokens, localStorage values, DB URLs, env values, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI output, full question/paper/material/resource content, or full DOM were recorded.
- Runtime evidence is limited to role label, route label, status category, and response envelope category.
- Database use was read-only for diagnosis; no destructive DB operation, migration, seed, fixture, or schema action was executed.
- Provider-enabled flows were not executed.
