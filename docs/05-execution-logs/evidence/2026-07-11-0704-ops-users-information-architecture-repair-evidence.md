# 0704 Ops Users Information Architecture Repair Evidence

## Scope

- Task ID: `0704-ops-users-information-architecture-repair-2026-07-11`
- Branch: `codex/0704-ops-users-information-architecture-repair`
- Runtime target: localhost UI source and unit validation only.
- Preview preparation: paused.
- Provider-enabled behavior: not executed.
- Staging/prod/deploy/env/secret/Cost Calibration: not executed.
- Screenshots/raw DOM/traces/videos: not captured.
- Direct DB connection or mutation: not executed.

## Redaction Boundary

This evidence records role labels, route labels, status categories, issue categories, fix summaries, command names, and test counts only. It does not record credentials, session values, cookies, tokens, localStorage, Authorization headers, DB URLs, env values, raw DB rows, internal numeric IDs, plaintext `redeem_code`, Provider payloads, raw prompts, raw AI output, full question/paper/material/resource/chunk content, raw employee answers, screenshots, raw DOM, traces, or videos.

## Requirement Mapping Result

| Requirement source                                   | Mapping result                                                                                                                     |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Full-role UI/UX source implementation entry          | Operations backend source change stays scoped to operations page information architecture and summary-first user/account surface.  |
| Batch 0 global foundation baseline                   | User page keeps context, summary, work area, and state separation without cross-domain ledgers.                                    |
| Batch 1 operations and super admin baseline          | User operations separates account family and risky account actions; logs and card operations remain dedicated operations surfaces. |
| Edition-aware authorization requirements and ADR-007 | UI visibility and page placement do not change `effectiveEdition`, `authorization`, `org_auth`, or `redeem_code` service rules.    |
| Redeem code plaintext decision                       | Dedicated card page still owns eligible operations card workflow; this task records no plaintext card value in evidence.           |

## Read-Only UI Assessment Summary

| Role label  | Route label         | Status category | Problem category                                                                                        |
| ----------- | ------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| super_admin | `/ops/users`        | rendered        | User management page showed organization authorization, card, audit log, and AI call log detail blocks. |
| super_admin | `/ops/users`        | rendered        | User management page fetched cross-domain ledgers not needed for user/account management.               |
| super_admin | `/ops/redeem-codes` | rendered        | Card page header showed redundant `企业授权` and self-link `卡密管理` buttons.                          |

## Fix Summary

| Area                        | File                                                                       | Fix summary                                                                                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Operations user page        | `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`           | Renamed first-level heading to `用户管理`; narrowed loading to sessions, users, and organizations; removed cross-domain panels, audit keyword filter, card generation branch, and cross-domain header links. |
| Operations card page header | `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`            | Removed shared page-header links for `企业授权` and `卡密管理`; dedicated card generation and plaintext exception copy remain in the page body.                                                              |
| Regression tests            | `tests/unit/admin-ops-summary-first-ui.test.ts` and legacy user-page tests | Added boundary assertions that `/ops/users` does not render or fetch cross-domain ledgers, and `/ops/redeem-codes` no longer renders the redundant header links.                                             |

## Validation Commands

| Command                                                                                                                                                                                                                                                                   | Result                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ops-summary-first-ui.test.ts`                                                                                                                                                                                     | RED pass as expected before implementation: 2 tests failed for old `/ops/users` title/cross-domain content and `/ops/redeem-codes` header links.   |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ops-summary-first-ui.test.ts`                                                                                                                                                                                     | pass: 1 file, 7 tests.                                                                                                                             |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ops-summary-first-ui.test.ts tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts tests/unit/phase-11-audit-log-coverage-hardening.test.ts tests/unit/phase-20-ra-06-02-user-role-detail-alignment.test.ts` | fresh pass after import cleanup: 4 files, 18 tests.                                                                                                |
| `corepack pnpm@10.26.1 run lint`                                                                                                                                                                                                                                          | pass: ESLint completed with 0 errors and 0 warnings after import cleanup.                                                                          |
| `corepack pnpm@10.26.1 run typecheck`                                                                                                                                                                                                                                     | pass: `tsc --noEmit`.                                                                                                                              |
| `git diff --check`                                                                                                                                                                                                                                                        | pass: no whitespace errors.                                                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-ops-users-information-architecture-repair-2026-07-11`                                                                                 | pass: pre-commit hardening passed, 11 files scanned.                                                                                               |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-ops-users-information-architecture-repair-2026-07-11 -SkipRemoteAheadCheck`                                                             | first run blocked on repository SHA checkpoint drift; checkpoint was updated to the current aligned `master/origin/master` SHA, then rerun passed. |

## Non-Claims

- This task only claims localhost UI information-architecture repair for the focused operations surfaces above.
- It does not claim staging readiness, production readiness, final release readiness, Provider readiness, or Cost Calibration readiness.
