# 0704 Ops Users Information Architecture Repair

## Task Metadata

- taskId: `0704-ops-users-information-architecture-repair-2026-07-11`
- branch: `codex/0704-ops-users-information-architecture-repair`
- base: `origin/master@2a04856b487483067f2e25ad8f3e39cbbc036b8d`
- status: `ready_for_closeout`
- scope: repair operations backend information architecture so `/ops/users` is user/account management only, and remove redundant header buttons from `/ops/redeem-codes`.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-localhost-ui-polish-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-localhost-ui-polish-audit.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/README.md`

## Implementation Boundary

- Allowed source changes:
  - `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
  - `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- Allowed tests:
  - `tests/unit/admin-ops-summary-first-ui.test.ts`
  - affected legacy tests only if they encode the old `/ops/users` cross-domain layout.
- Allowed docs/state:
  - this task plan
  - redacted evidence and audit files
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
- Blocked:
  - API contract, permission model, service/repository behavior, database schema, migration, seed, package/lockfile, dependency, env/secret, staging/prod/deploy, Provider-enabled behavior, Cost Calibration.

## UI Repair Plan

1. Add RED tests:
   - `/ops/users` renders `用户管理`, not `运营后台闭环`.
   - `/ops/users` does not render detailed panels for `企业授权`, `卡密管理`, `审计日志`, `AI 调用日志`, or `企业组织与员工`.
   - `/ops/users` does not request `/api/v1/org-auths`, `/api/v1/redeem-codes`, `/api/v1/audit-logs`, `/api/v1/ai-call-logs`, or `/api/v1/employees`.
   - `/ops/redeem-codes` does not render header links `企业授权` or self-link `卡密管理`.
2. Update `AdminOpsManagement`:
   - narrow data loading to sessions, users, and organizations needed for organization-admin account creation.
   - remove audit keyword filter, cross-domain header links, cross-domain summary counts, card generation state/action, and cross-domain panels.
   - keep user list, user detail, reset password, enable/disable user, backend account creation, and security policy.
3. Update `AdminRedeemCodePage` header:
   - remove the two top-right action links selected by the user.
   - keep the dedicated card generation flow and plaintext exception copy intact.

## Evidence Plan

- Evidence path: `docs/05-execution-logs/evidence/2026-07-11-0704-ops-users-information-architecture-repair-evidence.md`
- Audit path: `docs/05-execution-logs/audits-reviews/2026-07-11-0704-ops-users-information-architecture-repair-audit.md`
- Evidence records only role label, route label, status category, problem category, fix summary, command name, test count, and pass/fail.
- No credentials, session/cookie/token, env value, DB URL, DB row, internal id, raw DOM, screenshot, Provider payload, raw prompt, raw AI output, plaintext `redeem_code`, full question/paper/material/resource/chunk, or raw employee answer.

## Validation Plan

- `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ops-summary-first-ui.test.ts`
- affected legacy test update/rerun if old `/ops/users` assertions fail.
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-ops-users-information-architecture-repair-2026-07-11`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-ops-users-information-architecture-repair-2026-07-11 -SkipRemoteAheadCheck`
- After merge to `master`, rerun required gates on `master`, push, delete the short branch, and confirm clean/aligned.

## Adversarial Review Focus

- Permission boundary: UI removal must not weaken backend authorization or create new access.
- Data boundary: `/ops/users` must not fetch unrelated logs/card/auth ledgers just to render user management.
- Sensitive information: committed evidence stays redacted; no screenshots/raw DOM/traces.
- Edition boundary: standard/advanced authorization semantics remain on dedicated authorization/card pages.
- Employee/admin isolation: user management can bind organization-admin account creation to an organization selector, but employee/organization ledgers stay on dedicated pages.
- UI state completeness: loading/empty/error/disabled/reset/enable states remain visible and actionable.
