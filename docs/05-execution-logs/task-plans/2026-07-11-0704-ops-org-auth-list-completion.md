# 0704 Ops Org Auth List Completion

## Task Metadata

- taskId: `0704-ops-org-auth-list-completion-2026-07-11`
- branch: `codex/0704-ops-org-auth-list-completion`
- base: `fd18df14d13b41a1af70e88eeb7d8781a0e7ffbc`
- goal: make the enterprise authorization list the primary operations workflow with server pagination, reusable filters, readable organization names, and an on-demand creation drawer while preserving all authorization write semantics.

## Required Reading

- `AGENTS.md`, current state/queue, code taste commandments, every ADR
- requirements indexes, authorization context, operations authorization/quota, edition-aware authorization, ADR-007, org-auth scope decisions, and the operations authorization UI/UX contract
- latest organization-management split, multi-scope authorization, inheritance, preview-risk, Provider-gate, and organization-tree evidence/audits
- approved enterprise-management screenshot and the approved optimization proposal
- org-auth contracts, runtime route/service/repository, enterprise-management UI, shared admin-list components, and focused tests

## Existing Business Semantics

- `org_auth` creation remains a governed package expanded into existing atomic scope behavior; active overlap remains denied.
- Original `edition`, computed `effectiveEdition`, upgrade state, quota, dates, cancellation, and audit attribution remain server-owned.
- Create and cancel endpoints, request bodies, validation, confirmation, and audit behavior do not change.
- The UI must not auto-renew, upgrade, expand quota, merge overlap, or infer an authorization version.

## Scope

1. TDD a dedicated read-only org-auth list query with page, page size, keyword, status, edition, profession, level, expiry status, and deterministic sort.
2. Define `expiring_soon` as active authorization expiring after now and within 45 days; `not_expiring_soon` means active authorization after that window. Expired records continue to use the existing status filter.
3. Return display-safe list rows with purchaser organization name and covered organization name/count summaries; keep public operation references available only for row actions and never render them as ordinary copy.
4. Use server filtering, total, and pagination; filter, sort, and page-size changes return to page one, and reset restores the initial query.
5. Make the authorization list the first content in the authorization view. Use the shared toolbar, table frame, pagination, and list-state pattern.
6. Render columns for authorization, purchaser, covered organizations, version/profession/level, quota, validity, status, and actions. Keep covered organizations left-aligned.
7. Move the existing creation form behind the single `新增企业授权` primary action in a right-side drawer. Reuse the existing builder, overlap guidance, confirmation, and POST body unchanged.
8. Refresh the list after create or cancel. Keep detail loading localized and prefer organization names over public operation references.

## Allowed Files

- state/queue and this task plan/evidence/audit
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- directly related repository tests
- `src/server/services/admin-organization-org-auth-runtime.ts`
- directly related route/service tests
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- shared admin-list imports without changing package dependencies
- focused organization authorization UI/runtime tests
- directly affected summary-order and authorization-detail regression tests

## Explicit Exclusions

- no org-auth create/cancel/upgrade/overlap/quota/effective-edition business-rule change
- no organization, employee, redeem-code, audit-log, or Provider behavior change
- no schema, migration, seed, direct database execution, dependency, package/lockfile, env/secret, staging, production, deploy, screenshot capture, raw DOM, PR, or force push

## TDD And Verification

1. RED contract/service/repository/UI tests for server filters, pagination, list-first layout, hidden create drawer, readable organization names, reset, and existing write payload freeze.
2. GREEN with the minimum dedicated read contract and list UI.
3. Adversarial review of role scope, organization scope, edition/effective-edition, overlap, quota, cancellation, sensitive identifiers, and state completeness.
4. Run targeted tests, lint, typecheck, formatting, diff check, and Module Run v2.
5. Commit, fast-forward merge, master rerun, push, branch cleanup, and clean/aligned confirmation.

## Acceptance

- more than one page of authorizations is fully reachable and the server total matches the UI
- keyword, status, edition, profession, level, expiry, sorting, page size, and reset use one consistent list pattern
- purchaser and covered organizations use names and counts; public operation references are not visible copy
- the list appears before the on-demand creation workflow, and the creation drawer is closed by default
- create/cancel endpoint paths, bodies, overlap validation, effective-edition calculation, quota semantics, and confirmation remain unchanged
- loading, ready, initial empty, filtered empty, localized error, detail loading/error, drawer, and disabled states are distinguishable
