# Traceability: Security Permission Role Boundary Inventory

- Task id: `security-permission-role-boundary-inventory-2026-06-29`
- Source story: `seeded_by_detail_optimization_security_review_kickoff_2026_06_29`
- Branch: `codex/security-role-boundary-inventory-20260629`
- Scope: source-read-only authorization and role-boundary inventory.

## Requirement Mapping

| Requirement                                                                                   | Verification Surface                                                                                                            | Status             |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Identify role and authorization boundary surfaces without runtime execution.                  | `src/server/auth/**`, `src/server/services/**`, `src/server/repositories/**`, `src/app/api/v1/**`, selected unit coverage paths | complete           |
| Split actionable permission or role risks into future scoped tasks.                           | Findings `role-inv-001` through `role-inv-003` and queue candidate split                                                        | complete           |
| Keep source/test implementation unchanged in this inventory task.                             | Git diff and Module Run v2 scope scan                                                                                           | pending validation |
| Preserve release, DB, Provider, browser, dependency, and sensitive evidence gates as blocked. | Evidence, audit, acceptance, and Module Run v2 closeout                                                                         | pending validation |

## Surface Index

| Surface                                               | Count / Selection | Evidence Mode                              | Status   |
| ----------------------------------------------------- | ----------------: | ------------------------------------------ | -------- |
| Read-only source/test files scanned by path inventory |               834 | file count only                            | complete |
| `src/server/auth/**` files                            |                11 | file path plus redacted boundary summary   | complete |
| `src/app/api/v1/**` route files                       |               116 | route path plus redacted binding summary   | complete |
| Auth/session/authorization-related unit surfaces      |                54 | test path count and coverage category only | complete |

## Inventory Matrix

| Area                                   | Representative Surfaces                                                                                                                                                                                            | Observed Boundary                                                                                                                                                                                              | Risk Status             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Session and post-login boundary        | `src/server/contracts/user-auth/session-boundary.ts`, `src/server/auth/session-route.ts`, `src/server/services/session-service.ts`                                                                                 | Contract states server-session persistence and no bearer-token exposure; route sets session cookie from login response.                                                                                        | finding: `role-inv-001` |
| Role routing and workspace separation  | `src/server/services/admin-workspace-role-guard-service.ts`, `src/server/contracts/admin-workspace-role-guard-contract.ts`                                                                                         | Organization admins are restricted to organization workspace unless `super_admin`; advanced workspace checks service-computed capability and org authorization source.                                         | covered                 |
| Student and employee session boundary  | `src/server/services/student-flow-runtime.ts`, `src/server/services/student-authorization-redeem-runtime.ts`, `src/server/services/organization-training-route.ts`                                                 | Student routes reject admin sessions; organization training employee routes require employee user type and effective org authorization context.                                                                | covered                 |
| Admin ops runtime guards               | `src/server/services/admin-flow-runtime.ts`, `src/server/services/admin-organization-org-auth-runtime.ts`, `src/server/services/admin-redeem-code-runtime.ts`, `src/server/services/admin-ai-audit-log-runtime.ts` | Runtime handlers resolve current session and require admin roles before read/write operations; privileged operations narrow to `super_admin` and/or `ops_admin` as appropriate.                                | covered                 |
| Admin content and AI generation guards | `src/server/services/admin-ai-generation-local-contract-route.ts`, `src/server/services/admin-ai-generation-formal-adoption-runtime.ts`                                                                            | Content workspace is limited to `super_admin`/`content_admin`; organization AI local contract requires `org_advanced_admin` or `super_admin` plus organization binding; formal adoption requires content role. | watch: `role-inv-003`   |
| Organization analytics admin boundary  | `src/server/services/organization-analytics-route.ts`, `src/server/services/organization-analytics-service.ts`, `src/server/repositories/organization-analytics-repository.ts`                                     | Runtime accepts `super_admin`/`org_advanced_admin`; service then requires advanced org context and repository-visible scope containing requested organization.                                                 | watch: `role-inv-002`   |
| API route binding                      | `src/app/api/v1/**/route.ts`                                                                                                                                                                                       | App Router entries delegate to runtime route handlers rather than duplicating role logic.                                                                                                                      | covered                 |

## Findings And Follow-Up Tasks

| Finding        | Severity | Status               | Evidence Summary                                                                                                                                                                                                                                                                                                       | Follow-up Task                                                              |
| -------------- | -------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `role-inv-001` | high     | actionable follow-up | Login service returns a session credential field to the route so the route can set a cookie, while the post-login boundary contract records `exposeBearerTokenToClient: false`; current evidence did not prove the final JSON response strips that credential.                                                         | `verify-session-login-response-credential-boundary-2026-06-29`              |
| `role-inv-002` | medium   | watch follow-up      | Organization analytics route synthesizes advanced org context from session role and query organization, but the service/repository layer does enforce visible organization scope before aggregate reads. A focused task should prove the capability-source contract remains aligned with workspace guard expectations. | `verify-organization-analytics-admin-capability-source-boundary-2026-06-29` |
| `role-inv-003` | medium   | watch follow-up      | Organization AI generation local contract allows organization workspace from `org_advanced_admin` plus organization binding and records Provider-disabled boundaries; a focused task should prove this path cannot bypass service-computed organization capability if roles drift.                                     | `verify-organization-ai-generation-capability-source-boundary-2026-06-29`   |

## Covered Boundaries

- No release, staging/prod/cloud, deploy, release readiness, final Pass, or Cost Calibration work was performed.
- No browser runtime, dev server, DB connection, schema/migration/seed, Provider/AI call, model/provider configuration, package/lockfile, source, or test write was performed.
- No credential, cookie, token, session, localStorage, Authorization header, env, secret, connection string, raw DOM, screenshot, trace, raw DB row, PII, plaintext redeem_code, Provider payload, prompt, raw AI input/output, or complete question/paper/material/resource/chunk content was recorded in committed evidence.

## Next Minimal Task Recommendation

Recommended next task: `verify-session-login-response-credential-boundary-2026-06-29`.

Rationale: `role-inv-001` sits directly on the login/session boundary and has the smallest high-value blast radius. The task should be a focused source/test repair or verification task with explicit allowed files for `src/server/auth/session-route.ts`, `src/server/services/session-service.ts`, session contracts, and matching unit tests; it must still avoid DB, Provider, browser, dependency, release, final Pass, and Cost Calibration work unless separately materialized.
