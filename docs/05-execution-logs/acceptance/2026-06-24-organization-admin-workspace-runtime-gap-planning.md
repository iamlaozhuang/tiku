# Planning Output: organization-admin-workspace-runtime-gap-planning-2026-06-24

## Summary

`GAP-ORG-01` remains open after the learner entry repair. The next executable work should not directly edit backend UI
source because the requirement SSOT mandates a design-first artifact before broad backend workspace changes.

This planning task therefore creates the scoped next task:
`organization-admin-workspace-design-first-scope-2026-06-24`.

## Requirement Mapping Result

- Result: `pass_organization_admin_workspace_gap_scope_planned_no_source_no_runtime`.
- Mapped SSOT:
  - `docs/01-requirements/modules/06-admin-ops.md`.
  - `docs/01-requirements/stories/epic-06-admin-ops.md`.
  - `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
  - `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
  - `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
  - `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
  - `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- Required repair boundary:
  - first-class organization admin workspace;
  - organization-scoped employee management and authorization/status;
  - standard organization admin denial of enterprise training and organization AI;
  - advanced organization admin enterprise training plus organization `AI出题` and `AI组卷`;
  - denial of global operations, global authorization, `redeem_code`, content authoring, Provider, cost, payment, and
    staging/prod surfaces.

## Role Mapping Result

| Role row             | Planned allowed behavior                                                                                                             | Planned denied or unavailable behavior                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | Organization backend landing; visible `退出登录`; employee management; organization authorization/status and basic organization view | Enterprise training management; organization `AI出题`/`AI组卷`; global ops users/org auth/redeem code/resources/logs; content authoring; Provider |
| `org_advanced_admin` | Organization backend landing; visible `退出登录`; employee management; authorization/status; enterprise training; `AI出题`/`AI组卷`  | Global system operations outside scoped `organization`; content authoring; Provider/model configuration; cost calibration; payment; staging/prod  |
| `ops_admin`          | Remains system operations workspace                                                                                                  | Must not be used as the organization admin workspace                                                                                              |
| `content_admin`      | Remains content backend workspace                                                                                                    | Must not be used as the organization admin workspace                                                                                              |

## Acceptance Mapping Result

- Planning acceptance: passed for docs/state scope only.
- Runtime acceptance: not executed and not claimed.
- Chinese UI acceptance: recorded as mandatory for the follow-up design and implementation tasks. Visible labels,
  navigation, action labels, empty/error/loading states, denial/unavailable copy, and logout must be Chinese in future
  runtime validation.
- Final MVP Pass: not claimed.

## Design-First Task To Create Next

Task id: `organization-admin-workspace-design-first-scope-2026-06-24`.

Task kind: `docs_requirement_alignment`.

Purpose:

- Produce the design-first artifact required by `US-06-01 AC-8` before broad organization/admin backend UI changes.
- Define information architecture, route map, navigation groups, page states, component reuse, role/edition boundaries,
  Chinese UI requirements, and exact allowed implementation files for the later source task.

Expected output:

- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-design-first-scope.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-design-first-scope.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-design-first-scope.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-design-first-scope.md`.
- Updated `project-state.yaml` and `task-queue.yaml`.

Design artifact minimum contents:

- Organization workspace landing route and fallback route behavior.
- Sidebar/top navigation labels in Chinese.
- Logout placement and state.
- Standard organization admin surfaces: employee management, organization authorization/status, basic organization
  information.
- Advanced organization admin surfaces: all standard surfaces plus enterprise training, organization `AI出题`, and
  organization `AI组卷`.
- Direct-route denial matrix for `/ops/*`, `/content/*`, global `redeem_code`, global `org_auth`, Provider, cost,
  payment, and staging/prod surfaces.
- Empty, loading, error, unauthorized, standard-unavailable, expired-authorization, and upgrade-state copy.
- Exact source/test file allowlist for the later implementation task.
- Blocked gate inventory.

## Later Implementation Candidate

Candidate task id: `organization-admin-workspace-runtime-repair-2026-06-24`.

This task should stay pending or unseeded until the design-first artifact closes. It should be split further if the
design artifact finds the change is too broad for one reviewable implementation commit.

Likely implementation slices:

1. Role-aware organization backend landing, workspace shell, navigation, and logout.
2. Standard admin organization-scoped employee and authorization/status surfaces.
3. Advanced admin enterprise training and organization AI entries, with direct-route unavailable/denial states.
4. Route/service guards and focused unit tests for global ops/content denial.
5. Chinese UI visible-label cleanup for the touched organization admin surfaces.

## Blocked Remainder

- Real Provider-backed `AI出题` or `AI组卷` generation remains blocked.
- Prompt, provider payload, raw generated content, quota/cost, and Cost Calibration Gate remain blocked.
- Schema, migration, seed, or database changes remain blocked.
- Browser/runtime acceptance requires a later task with explicit local runtime scope and owner-account handling.
- Staging/prod, payment, external service, deploy, PR, force push, and final Pass remain blocked.
