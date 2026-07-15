# P0 RC-01 Schema/Migration Fresh Approval Request

Date: 2026-07-14

Task: `p0-remediation-rc-01-identity-session-admin-account-2026-07-14`

Status: `approved`

## Human Approval Evidence

2026-07-14，用户明确批准：

> 批准上述 schema/migration 源码编写、测试和提交范围。批准后继续执行 RC-01，不再中途停顿，直至遇到下一个真实审批边界或 Goal 完成。

该批准仅解除下述“Requested Human Approval”范围，不扩大“Explicitly Not Requested”边界。

## Why This Is Required

F-0002 cannot be closed while admin login failure state has no persisted columns. F-0045 cannot meet the explicit multi-role and single-organization invariants while the schema only has one `admin.admin_role` value and allows more than one `admin_organization` row per admin. A process-local cache or service-only check would remain bypassable across instances or direct writes.

## Requested Human Approval

Please provide human approval for this task to author, test, and commit only the following schema/migration source changes:

1. Add `admin.login_failed_count`, `admin.locked_until_at`, and `admin.disabled_at`.
2. Add `admin_role_assignment` with unique `(admin_id, admin_role)` and include a forward migration backfill from existing `admin.admin_role`.
3. Add a unique index on `admin_organization.admin_id`; migration apply must fail rather than silently select/delete conflicting existing bindings.
4. Update schema/model/seed source adapters and unit tests required by those definitions.
5. Generate and inspect one Drizzle migration, snapshot, and journal entry using a non-secret dummy `DATABASE_URL` only for generation in the isolated worktree.

## Explicitly Not Requested

- No migration apply or database connection/read/write.
- No `.env.local` read/change, raw DB row inspection, data cleanup, seed/fixture execution, or destructive SQL.
- No dependency/package/lockfile change.
- No browser/e2e/runtime acceptance, Provider, external service, PR, force push, deployment, staging, or production action.
- No removal of the existing `admin.admin_role` compatibility column in this task.

If future migration apply discovers duplicate `admin_organization` bindings, that is a separate data-governance approval boundary and this task must stop without modifying data.
