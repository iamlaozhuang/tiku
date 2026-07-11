# 0704 Ops Backend Account List

## Task Metadata

- taskId: `0704-ops-backend-account-list-2026-07-11`
- branch: `codex/0704-ops-backend-account-list`
- base: latest `origin/master`
- goal: add a read-only, server-scoped backend-account list and separate learner/employee accounts from backend accounts in user management.

## Required Reading

- `AGENTS.md`, current state/queue, code taste commandments, every ADR
- requirements indexes, user-auth/admin-ops modules, edition-aware authorization boundary, role-separated traceability
- latest user-management, shared-list, and role-workbench evidence/audits
- approved user-management screenshot and backend-account list recommendation
- admin schema relations, runtime route/service/repository, admin-account creation validator, user-management UI, and focused tests

## Existing Permission Semantics

- `super_admin` may read all backend admin roles.
- `ops_admin` is a platform operations role in the current model and may create organization administrators for active organizations; it has no separate organization visibility scope.
- Therefore `ops_admin` list visibility is server-cropped to `org_standard_admin | org_advanced_admin` across the currently managed platform organizations and must never include `super_admin | ops_admin | content_admin`.
- No new organization-scope or write permission rule is introduced.

## Scope

1. TDD a paginated `GET /api/v1/admin-accounts` standard response.
2. Add dedicated typed list query/DTO fields: public operation id, account name/phone, role, status, registration time, and organization display contexts only.
3. Query admin rows with relation-loaded organizations and deterministic ordering; never return password/hash/session/lock material or numeric ids.
4. Add server-side visible-role cropping before repository access and tests for super, operations, content, and unauthenticated actors.
5. Split `/ops/users` into accessible `学员与员工账号` and `后台账号` tabs.
6. Backend tab uses shared toolbar/table/pagination, keyword/role/status/organization/page-size filters, a registration sort control, reset, create action, and a collapsed security-policy detail.
7. Creation success refreshes the backend account list without changing the existing POST body, validation, or permission behavior.

## Allowed Files

- state/queue and this task plan/evidence/audit
- `src/app/api/v1/admin-accounts/route.ts`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/server/repositories/admin-flow-runtime-repository.test.ts`
- `src/server/services/admin-flow-runtime.ts`
- `src/server/services/admin-flow-runtime.test.ts`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `tests/unit/admin-ops-summary-first-ui.test.ts`
- `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`
- directly related route/redaction regression tests if required

## Explicit Exclusions

- no backend-account enable, disable, reset, delete, role-change, or organization-rebind write endpoint
- no user/employee/authorization/card/organization business-rule change
- no schema, migration, seed, direct DB execution, dependency, package/lockfile, Provider, Cost Calibration, env/secret, staging, production, deploy, screenshot, raw DOM, PR, or force push

## TDD And Verification

1. RED route/service/repository/UI tests for missing GET, scope crop, relation mapping, tabs, filters, pagination, creation refresh, and redaction.
2. GREEN with minimum contract, repository, route, and UI changes.
3. Adversarial review of role scope, organization context, password/session exclusion, account-domain isolation, edition boundary, empty/error/forbidden/disabled states.
4. Run targeted tests, lint, typecheck, formatting, diff check, Module Run v2.
5. Commit, fast-forward merge, master rerun, push, branch cleanup, clean/aligned confirmation.

## Acceptance

- newly created backend accounts appear in the backend list after refresh
- backend list filters, sorting, page size, pagination, and reset operate independently from learner/employee list state
- learner/employee accounts never appear in the backend list
- operations administrators cannot obtain platform administrators through any query parameter
- no initial password, credential hash, session, lock material, raw internal id, or organization numeric id appears in the response or UI
- existing creation POST and learner lifecycle behavior remain unchanged
