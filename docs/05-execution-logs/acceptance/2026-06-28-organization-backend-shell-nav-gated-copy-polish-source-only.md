# Organization Backend Shell Nav Gated Copy Polish Source-Only Acceptance

Task id: `organization-backend-shell-nav-gated-copy-polish-source-only-2026-06-28`

Branch: `codex/organization-backend-shell-nav-gated-copy-polish-20260628`

Acceptance label: `source_only`

result: pass_source_only

## Accepted Scope

This task can accept only the source-only organization backend shell/navigation polish slice:

- advanced organization navigation entries are grouped under `高级组织能力`;
- standard organization admins receive safe standard-edition shell guidance and a `返回组织概览` action;
- forbidden direct-route states expose role-appropriate return links;
- visible logout and role-scoped navigation remain covered by focused unit tests.

## Not Accepted By This Task

- `permission_contract`
- `page_state_polish`
- `browser_validation`
- `db_schema`
- `provider_cost`
- `staging_prod_release`
- `final_pass`

## Acceptance Mapping Result

| Acceptance item                                                      | Result           |
| -------------------------------------------------------------------- | ---------------- |
| Task plan exists before source edits                                 | pass             |
| Task queue lists exact source/test allowed files before source edits | pass             |
| Focused RED evidence proves missing shell/nav/gated-copy polish      | pass             |
| Focused GREEN evidence proves source-only implementation             | pass             |
| Standard organization advanced links remain hidden                   | pass             |
| Advanced organization entries are grouped                            | pass             |
| Forbidden direct-route states expose role-appropriate return actions | pass             |
| Browser/dev-server/e2e excluded                                      | pass_not_run     |
| DB/schema/migration/seed excluded                                    | pass_not_touched |
| Provider/Cost Calibration excluded                                   | pass_not_run     |
| Release readiness/final Pass excluded                                | pass_not_claimed |
| Full local validation and Module Run v2 gates                        | pass             |

## Acceptance Decision

Accepted for `source_only` organization backend shell/navigation polish. This task does not accept page-state polish, permission contract behavior, browser validation, DB/schema work, Provider/Cost readiness, staging/prod/release readiness, or final Pass.

## Next Recommended Task

After this task closes and its branch is merged/pushed/cleaned under the approved batch closeout boundary, the next serial task is:

- `organization-workspace-page-states-polish-source-only-2026-06-28`
