# 0704 Ops Employee List Completion

## Task Metadata

- taskId: `0704-ops-employee-list-completion-2026-07-11`
- branch: `codex/0704-ops-employee-list-completion`
- base: `7b6ebb47d82817ffa8a31d84c65de78ac678f04e`
- goal: make the employee account list the primary operations workflow with server pagination, reusable filters, readable organization and inherited-authorization summaries, and on-demand import/transfer workflows while preserving all employee mutations.

## Required Reading

- `AGENTS.md`, current state/queue, code taste commandments, every ADR
- requirement indexes, admin operations, organization/authorization context, quota governance, edition-aware authorization, ADR-007, and employee UI/UX traceability
- latest employee import, transfer, organization-tree, authorization-list, preview-risk, and Provider-gate evidence/audits
- approved enterprise-management screenshot and the approved optimization proposal
- employee contracts, route/service/repository, enterprise-management UI, shared admin-list components, and focused import/transfer/unbind tests

## Frozen Business Semantics

- Employee import remains platform operations owned and keeps its existing parser, 500-row ceiling, template fields, safe-failure categories, quota preview, confirmation, and one-time initial-password distribution.
- Employee transfer keeps target authorization/quota locking, active-session revocation, training-state handling, answer snapshot retention, and existing endpoint/body.
- Employee unbind keeps personal-account conversion, quota refresh, session behavior, learning-history preservation, confirmation, and existing endpoint/body.
- Employee edition and capability continue to derive from active organization authorization; no employee-level authorization input or allowlist is introduced.

## Scope

1. TDD a dedicated read-only employee list query with page, page size, keyword, organization-name filter, status, and deterministic registration/update sorting.
2. Return display-safe list rows with employee name/phone, organization name, status, registration time, and count of currently active inherited authorization ranges. Keep public operation references only for actions and never render them as ordinary copy.
3. Use server filtering, total, and pagination; filter, sort, and page-size changes return to page one, and reset restores the initial query.
4. Make the employee table the first content in the employee view. Use the shared toolbar, table frame, pagination, and list-state pattern.
5. Move batch import behind the single `批量导入员工` primary action in a right-side drawer. Preserve template download, file/text input, preview, confirmation, result categories, and one-time password window.
6. Move transfer to each employee row. Open a focused drawer for target organization and existing impact review; only the existing eligible transfer action may proceed.
7. Keep unbind as a destructive row action with the existing confirmation. Refresh the current employee list after import, transfer, or unbind.
8. Distinguish loading, ready, initial/filtered empty, localized error, disabled pagination, drawer, confirmation, success, and safe-failure states.

## Allowed Files

- state/queue and this task plan/evidence/audit
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- directly related repository tests
- `src/server/services/admin-organization-org-auth-runtime.ts`
- directly related route/service tests
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- focused employee UI/import/transfer/unbind regression tests

## Explicit Exclusions

- no employee create/import/transfer/unbind parser, validator, endpoint, request body, quota, session, training, snapshot, authorization, or audit-rule change
- no organization-tree, org-auth write, redeem-code, audit-log, Provider, or content behavior change
- no schema, migration, seed, direct database execution, dependency, package/lockfile, env/secret, staging, production, deploy, screenshot capture, raw DOM, PR, or force push

## TDD And Verification

1. RED contract/service/repository/UI tests for employee list filters, pagination, list-first layout, hidden import drawer, readable organization/auth summaries, reset, row actions, and existing mutation payload freeze.
2. GREEN with the minimum dedicated read projection and employee-list UI.
3. Adversarial review of role scope, organization scope, employee/admin isolation, edition inheritance, quota, sessions, training snapshots, one-time passwords, sensitive identifiers, and state completeness.
4. Run targeted tests, lint, typecheck, formatting, diff check, and Module Run v2.
5. Commit, fast-forward merge, master rerun, push, branch cleanup, and clean/aligned confirmation.

## Acceptance

- more than one page of employees is fully reachable and the server total matches the UI
- keyword, organization name, status, sorting, page size, and reset use the shared list pattern
- employee rows use organization names, active inherited-authorization counts, and registration time; public operation references are not visible copy
- the employee list appears before on-demand import and transfer workflows
- import, transfer, and unbind endpoint paths, bodies, validation, quota/session/training semantics, confirmations, and one-time password behavior remain unchanged
- content-only and unauthenticated roles remain denied; employee and backend-admin account domains remain isolated
- loading, ready, empty, error, disabled, drawer, confirmation, and result states are distinguishable
