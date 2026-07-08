# 2026-07-08 Organization Portal Employee Summary Date Param

## Scope

- Task id: `organization-portal-employee-summary-date-param-2026-07-08`
- Branch: `codex/organization-portal-employee-summary-date-param`
- Goal: fix the organization portal readonly overview runtime 500 caused by the employee summary locked-count Date parameter.
- Allowed source files:
  - `src/server/repositories/organization-portal-overview-repository.ts`
  - `src/server/services/organization-portal-overview-route.test.ts`
- Evidence/audit files for this task only.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`

## Root Cause Evidence

- Localhost 0704 organization advanced admin session is valid and carries organization advanced capability.
- `GET /api/v1/organization-portal-overviews` returns HTTP 500 with business code `500001`.
- Read-only isolated reproduction shows the failing segment is the employee summary aggregation.
- Failure category: Drizzle raw SQL receives a JavaScript `Date` inside the raw `sql` fragment for locked employee count, and the postgres driver rejects that unencoded parameter.

No credentials, session values, cookies, localStorage values, DB URLs, raw DB rows, internal ids, provider payloads, prompt text, AI output, or full content are recorded.

## Requirement Mapping Result

| Source                                                                                          | Mapping                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/01-requirements/00-index.md`                                                              | Organization admin backend workspaces are part of the role-separated standard/advanced repair surface; runtime evidence must still avoid release/final-pass claims. |
| `docs/01-requirements/advanced-edition/00-index.md`                                             | `org_advanced_admin` organization backend may expose advanced entries, while basic portal overview remains scoped and readonly.                                     |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` and ADR-007 | `effectiveEdition` stays service-computed from authorization source and upgrade facts; this fix does not alter authorization semantics.                             |
| `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`      | `org_standard_admin` and `org_advanced_admin` must have organization admin workspace access to scoped employee roster/status and authorization/status.              |
| `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`                       | The organization portal is the scoped organization admin surface; this fix restores loading without claiming full role-runtime pass.                                |
| `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`       | Organization admins may view scoped employee roster/status and organization authorization/status; employee and authorization writes remain platform-owned.          |
| `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`    | This is a runtime bug fix under the organization workspace surface; it does not implement broader UI/UX baseline items.                                             |

## Implementation Plan

1. Add a focused regression test that calls the route with a repository implementation which fails if the locked summary Date is not converted into a driver-safe value.
2. Make the smallest repository fix: keep the existing locked-count predicate but pass an ISO timestamp string through a helper instead of a raw `Date`.
3. Run targeted route/repository-adjacent tests, adjacent organization admin surface tests, lint, typecheck, diff check, and Module Run v2 gates.
4. Write redacted evidence and adversarial audit.

## Risk Controls

- No DB/schema/migration/seed/fixture changes.
- No Provider calls.
- No env file changes or secret output.
- No package or lockfile changes.
- No changes to authorization semantics, advanced routes, training, analytics, AI, or UI layout.
- Keep API response envelope unchanged.
