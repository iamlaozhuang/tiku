# Organization Workspace UX Polish Permission Contract TDD Acceptance

Task id: `organization-workspace-ux-polish-permission-contract-tdd-2026-06-28`

Branch: `codex/organization-workspace-permission-contract-polish-20260628`

Acceptance label: `permission_contract_tdd`

result: pass_permission_contract_tdd

## Accepted Scope

This task can accept only the permission-contract TDD slice:

- advanced organization routes require service-computed capability summaries;
- advanced organization routes require `org_auth` authorization source;
- session fallback does not enable advanced organization menu entries or direct-route access;
- standard organization advanced routes remain gated by `standard_unavailable`;
- missing organization context remains denied before capability fallback.

## Not Accepted By This Task

- `db_backed_authorization`
- `schema_migration`
- `browser_validation`
- `provider_cost`
- `payment_export_ocr_external_service`
- `staging_prod_release`
- `final_pass`

## Acceptance Mapping Result

| Acceptance item                                                                 | Result           |
| ------------------------------------------------------------------------------- | ---------------- |
| Task plan exists before contract/source edits                                   | pass             |
| Task queue lists exact contract/source/test allowed files before contract edits | pass             |
| Focused RED evidence proves fallback/source gap                                 | pass             |
| Focused GREEN evidence proves permission-contract implementation                | pass             |
| Advanced organization capability requires service-computed summary              | pass             |
| Advanced organization capability requires `org_auth` source                     | pass             |
| UI helper cannot enable advanced menu entries from `session_fallback`           | pass             |
| Missing organization context remains denied                                     | pass             |
| Browser/dev-server/e2e excluded                                                 | pass_not_run     |
| DB/schema/migration/seed excluded                                               | pass_not_touched |
| Provider/Cost Calibration excluded                                              | pass_not_run     |
| Release readiness/final Pass excluded                                           | pass_not_claimed |
| Full local validation and Module Run v2 gates                                   | pass             |

## Acceptance Decision

Accepted only for `permission_contract_tdd` organization workspace UX polish. This task does not accept DB-backed authorization, schema work, browser validation, Provider/Cost readiness, payment/export/OCR/external-service work, staging/prod/release readiness, or final Pass.

## Next Recommended Task

After this task closes and its branch is merged/pushed/cleaned under the approved batch closeout boundary, the next serial task is:

- `organization-workspace-ux-polish-local-browser-validation-2026-06-28`
