# 0704 Ops List Consistency Acceptance Plan

## Task Metadata

- taskId: `0704-ops-list-consistency-acceptance-2026-07-11`
- branch: `codex/0704-ops-list-consistency-acceptance`
- base: `ed649267324cc7c3fd5d6b821b99b648778230d7`
- goal: complete the cross-page list consistency and adversarial acceptance matrix for operations users, applying only test-proven, low-risk UI corrections.

## Required Reading

- `AGENTS.md`, current state/queue, code taste commandments, every ADR
- requirements indexes, edition-aware authorization, role/operations UI decisions, and full-role UI/UX traceability
- task 1-8 plans/evidence/audits, preview-risk and Provider-gate boundaries
- approved private user, organization, card-code, and log screenshots; no screenshot is copied or newly captured
- shared admin-list components, user/backend-account page, organization/auth/employee/card-code page, audit-log page, and all focused UI/contract tests

## Readonly Findings Before TDD

- Backend account, enterprise authorization, employee, card-code, and audit-log lists use the shared toolbar/table/pagination pattern.
- Organization tree correctly uses branch expansion rather than destructive global pagination and preserves the province, city, district, station hierarchy.
- Learner/employee user list still uses page-local toolbar and pagination markup and has no reset control, so it does not meet the approved ordinary-list matrix.
- Enterprise/card-code headers and AI-call-log summary surfaces still expose internal `Admin Ops` or `summary-first` wording.
- Second-pass matrix review found that the AI-call-log list also retains page-local toolbar and pagination markup without reset.

## Scope

1. Add RED assertions for a shared learner/employee toolbar, table frame, pagination, reset, total, keyword, business filters, sorting, page size, and page-one reset behavior.
2. Migrate only the learner/employee list chrome to `AdminListToolbar`, `AdminTableFrame`, and `AdminPagination`; keep the existing user API contract, detail, password reset, enable/disable, and permission behavior.
3. Remove visible internal `Admin Ops` and `summary-first` wording from active operations surfaces without renaming test identifiers or changing route/data behavior.
4. Migrate the AI-call-log list chrome to the same shared toolbar, table frame, pagination, total, and reset behavior without changing calls, cost summaries, details, or Provider boundaries.
5. Run the consolidated acceptance matrix across shared list primitives, user filters, backend accounts, organization tree, enterprise authorization, employee operations, card-code generation/list separation, audit and AI-call logs, role guards, edition/authorization boundaries, redaction, and read-only REST contracts.
6. Produce redacted evidence and adversarial review. Do not add feature work after the matrix is green.

## Allowed Files

- state/queue and this task plan/evidence/audit
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`
- focused user, operations, organization/card-code, audit-log, shared-list, navigation, authorization, and read-only contract tests

## Explicit Exclusions

- no API, service, repository, validator, permission, organization-tree, authorization, edition, employee import/transfer/unbind, enterprise authorization, card-code generation/plaintext, audit retention, or log data behavior change
- no schema, migration, seed, direct database execution, dependency, package/lockfile, env/secret, Provider, Cost Calibration, staging, production, deploy, new screenshot/raw DOM/trace, PR, or force push

## Acceptance Matrix

- every ordinary list has keyword where appropriate, necessary business filters, reset, total, page size, and shared pagination
- filter, sort, page-size, and reset transitions return to page one; totals remain server-derived
- organization tree uses lazy branch expansion and full ancestor paths, not global pagination
- loading, initial empty, filtered empty, error, unauthorized/forbidden, disabled pagination, drawer, and confirmation states remain distinguishable
- status uses text and icon/label rather than color alone; labels, headings, table names, and controls have accessible names
- ordinary lists do not visibly expose public/internal identifiers; sensitive detail remains permission-gated and redacted
- high-risk actions retain second confirmation and server authorization
- standard/advanced edition, organization scope, learner/employee/admin account isolation, card-code plaintext, and audit-log boundaries remain unchanged
- targeted tests, lint, typecheck, format check, diff check, and Module Run v2 pass

## Closeout

- one reviewable commit, fast-forward merge to master, master gate rerun, push origin/master, delete the short branch, and confirm clean/aligned
- final claim is limited to localhost UI optimization completion
