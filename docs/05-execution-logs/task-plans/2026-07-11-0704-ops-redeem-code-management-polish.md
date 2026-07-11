# 0704 Ops Redeem Code Management Polish Plan

## Task

- taskId: `0704-ops-redeem-code-management-polish-2026-07-11`
- branch: `codex/0704-ops-redeem-code-management-polish`
- base: `850ce4119a3763e70b8cba130d73767b52b93632`
- runtime boundary: `localhost_ui_source_test_only`
- approval: `current_user_approved_ops_admin_ui_serial_execution_commit_merge_push_cleanup_2026_07_11`

## Required Reads

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md`
- latest operations UI foundation and organization management split evidence/audit
- private screenshots reviewed in memory only:
  - `D:/tiku-local-private/acceptance/screenshots/2026-07-07-three-role-page-review/super_admin__04__ops-redeem-codes.png`
  - `D:/tiku-local-private/acceptance/screenshots/2026-07-07-three-role-page-review/ops_admin__03__ops-redeem-codes.png`

## Scope

In scope:

- Rename operations navigation and operations overview entry from `卡密与企业授权` to `卡密管理`.
- Keep `/ops/redeem-codes` dedicated to redeem code generation, filtering, distribution, detail, and copy affordances.
- Remove stale cross-page/self navigation and system-staging explainer clutter from the card page.
- Use the existing admin list interaction pattern for page size, sorting, and pagination.
- Render the card list as a scannable table using existing design-token classes and the operations list primitives.
- Keep generated distribution separate from historical list rows.
- Add focused tests for menu naming, page duty boundary, filtering, pagination, sort, and unchanged generation/detail behavior.

Out of scope:

- No enterprise authorization business logic, route, payload, or service changes.
- No employee import or organization tree changes.
- No contact QR upload contract, storage, upload API, or resource contract.
- No plaintext `redeem_code` permission policy change.
- No audit log service semantics change.
- No Provider-enabled behavior.
- No staging/prod/deploy/env/secret/direct DB/schema/migration/seed/dependency/package/lockfile changes.

## Implementation Notes

- Preserve existing `GET /api/v1/redeem-codes`, `POST /api/v1/redeem-codes`, and detail endpoint usage.
- Use response `pagination` metadata when available; fall back to the visible row count for local fixtures.
- Reset page to 1 when filters, keyword, status, sort, or page size changes.
- Keep dangerous or sensitive actions secondary and retain existing confirmation before generation.
- Evidence must only record role label, route label, status category, problem category, fix summary, commands, and test counts.

## Validation Plan

- Red targeted tests before implementation:
  - `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-role-overview-ui.test.ts tests/unit/admin-ops-summary-first-ui.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- Green targeted tests after implementation:
  - same command as above
- Full local gates:
  - `corepack pnpm@10.26.1 run lint`
  - `corepack pnpm@10.26.1 run typecheck`
  - `git diff --check`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-ops-redeem-code-management-polish-2026-07-11`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-ops-redeem-code-management-polish-2026-07-11 -SkipRemoteAheadCheck`

## Adversarial Review Checklist

- Permission boundary unchanged.
- Data boundary remains paginated list/detail only; no raw DB rows or internal numeric ids.
- Standard/advanced edition and `effectiveEdition` semantics unchanged.
- Plaintext card display remains limited to already-authorized operations UI; evidence remains redacted.
- Enterprise authorization stays under `/ops/organizations`, not card management.
- No Provider, env, secret, staging/prod, direct DB, schema, seed, migration, dependency, or package lockfile change.
