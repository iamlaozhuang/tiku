# 2026-07-08 organization portal readonly overview

## Scope

- Branch: `codex/organization-portal-readonly-overview`.
- Goal: make `/organization/portal` show real organization-scoped readonly overview for `org_standard_admin` and `org_advanced_admin`.
- In scope:
  - current organization display name/status/edition context;
  - scoped employee roster preview and status counts;
  - scoped organization authorization status, effective edition, validity window, quota, and scope summary;
  - standard/admin advanced UI boundary preservation.
- Out of scope:
  - operations write endpoints;
  - employee import/create/update/disable/unbind;
  - `org_auth` create/update/cancel/upgrade;
  - training, analytics, organization AI feature changes;
  - DB schema, migration, seed, fixture, dependency, package/lockfile, Provider, env, staging/prod/deploy, Cost Calibration.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/README.md`

## Root Cause

Current `/organization/portal` only requests `/api/v1/sessions`. Its employee and authorization cards are static copy, and the existing unit test asserts only the session request. The page therefore cannot show actual scoped employees or organization authorization state even when the local DB has data.

Existing global employee and `org_auth` APIs are platform operations surfaces. Reusing or loosening those permissions would violate the first-release organization-admin boundary.

## Requirement Mapping Result

| Source                                                                                       | Mapping                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/01-requirements/modules/01-user-auth.md`                                               | First release organization admins may view own organization basic info, employee roster/status, and authorization status; employee and authorization maintenance stays platform-owned.            |
| `docs/01-requirements/modules/06-admin-ops.md`                                               | `org_standard_admin` is limited to scoped employee/status and enterprise authorization/status; `org_advanced_admin` gets the same readonly base plus advanced entries.                            |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`          | `effectiveEdition` is service-computed; UI discovery must not become authorization logic. The new route consumes service-computed organization capability.                                        |
| `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md` | Organization portal should show readable organization context, roster/status, authorization/status, and explicit readonly boundary without implying employee or authorization mutation authority. |

## Implementation Plan

1. Add failing tests first:
   - frontend portal test expects a second request to a dedicated readonly overview API and verifies rendered organization, employees, authorization, standard/advanced boundaries, and no technical identifiers;
   - backend route/service test verifies session-derived organization scope, standard/advanced org admins are allowed, missing org context is denied, and DTOs exclude internal ids.
2. Add a dedicated readonly API:
   - route: `/api/v1/organization-portal-overviews`;
   - contract/service/repository files scoped to organization portal overview only;
   - admin context derived from current session and service-computed `adminWorkspaceCapability`;
   - no client-supplied organization id.
3. Update `AdminOrganizationPortalPage` to load the overview and replace static summary cards with actual scoped counts/list/auth summary.
4. Preserve existing advanced cards only for eligible `org_advanced_admin`; standard admins keep explanatory, non-actionable advanced-unavailable state.
5. Write redacted evidence and adversarial audit.

## Risk Controls

- No package/lockfile/dependency changes.
- No DB/schema/migration/seed/fixture changes.
- No Provider/env/staging/prod/deploy work.
- No raw DB rows, internal ids, credentials, session/cookie/token/localStorage, Provider payload, raw prompts, raw AI output, full question/paper/material/resource content in evidence.
- No organization-admin mutation UI or API permissions.
- Service authorization remains server-side; UI visibility is not an auth boundary.

## Validation Plan

- Red test run before implementation.
- Focused route/service and frontend unit tests after implementation.
- `npm run lint`
- `npm run typecheck`
- `git diff --check`
- Adversarial review recorded in `docs/05-execution-logs/audits-reviews/`.
- Merge to `master`, rerun relevant gates on `master`, push after user-approved closeout, delete short branch, confirm clean and aligned.
