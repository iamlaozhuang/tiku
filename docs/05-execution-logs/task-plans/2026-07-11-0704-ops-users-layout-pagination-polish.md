# 0704 Ops Users Layout Pagination Polish

## Task Metadata

- taskId: `0704-ops-users-layout-pagination-polish-2026-07-11`
- branch: `codex/0704-ops-users-layout-pagination-polish`
- base: `origin/master@030764bbbdea870f33a2b58973265d16f2565cf3`
- status: `ready_for_closeout_local_commit_only`
- scope: improve `/ops/users` visual hierarchy and information layout after the information-architecture repair.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- Product Design `audit` skill, router, critical overrides, and user-context preflight
- Frontend testing/debugging skill
- TDD skill

## User Questions Answered

1. The selected “运营筛选” block is a user-list filter and sort control, not an operations-wide filter. It should be renamed and visually grouped as user filtering.
2. The selected “后台账号创建” block is an account creation form, not a filter. It should be titled, explained, and visually separated from list filtering.
3. The user list needs pagination. The implementation should reuse the existing admin list interaction contract, including `ADMIN_PAGE_SIZE_OPTIONS`, instead of introducing a new pagination convention.

## Implementation Boundary

- Allowed source:
  - `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
  - `src/hooks/useAdminListInteraction.ts`
  - `src/server/contracts/admin-interaction-contract.ts`
- Allowed tests:
  - `tests/unit/admin-ops-summary-first-ui.test.ts`
  - `tests/unit/admin-shell-common-interaction.test.ts`
  - affected legacy tests only if they encode old labels or no-pagination behavior
- Allowed docs/state/evidence:
  - this task plan
  - redacted evidence and audit files
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
- Blocked:
  - API contract, backend authorization, service/repository behavior, database schema, migration, seed, dependency, package/lockfile, env/secret, staging/prod/deploy, Provider execution, Cost Calibration.

## Design Audit Summary

- `/ops/users` currently has correct domain scope but weak visual hierarchy: summary, filters, security policy, account creation, and list are all similar cards.
- The user filter block lacks a heading, uses the old “运营筛选” accessible name, and its help text mixes filter refresh with write-action warning.
- The account creation form lacks a visible heading and reads like another inline filter row.
- The list renders as an unbounded row stack; it needs page-size control, visible range, and next/previous controls.

## TDD Plan

1. Add RED assertions:
   - user filter region is labelled `用户筛选` and contains page-size control.
   - backend account creation region contains a visible `创建后台账号` heading and explanatory text.
   - user list renders only the current page and exposes `上一页` / `下一页` controls plus range text.
2. Implement minimal UI:
   - reuse `useAdminListInteraction`, `ADMIN_PAGE_SIZE_OPTIONS`, and the shared admin list contract for page-size, page change, filtering reset, and sorting.
   - keep list actions unchanged.
   - restructure filter and account creation surfaces with existing tokens/components.
3. Verify targeted tests, lint, typecheck, diff check, and Module Run v2.

## Evidence Plan

- Evidence path: `docs/05-execution-logs/evidence/2026-07-11-0704-ops-users-layout-pagination-polish-evidence.md`
- Audit path: `docs/05-execution-logs/audits-reviews/2026-07-11-0704-ops-users-layout-pagination-polish-audit.md`
- Evidence records only role label, route label, status category, issue category, fix summary, command name, and test count.
- No screenshots, raw DOM, credentials, sessions, cookies, tokens, env values, DB URLs, raw DB rows, internal IDs, plaintext card values, Provider payloads, raw prompts, raw AI output, or full content.

## Validation Plan

- `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ops-summary-first-ui.test.ts`
- affected focused legacy tests if needed
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-ops-users-layout-pagination-polish-2026-07-11`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-ops-users-layout-pagination-polish-2026-07-11 -SkipRemoteAheadCheck`

## Adversarial Review Focus

- Permission boundary: UI-only changes must not weaken backend authorization.
- Data boundary: no new cross-domain fetches from `/ops/users`.
- Sensitive information: no screenshots/raw DOM or private values in committed evidence.
- Edition boundary: standard/advanced authorization rules remain on dedicated authorization/card pages.
- UI state completeness: empty, filter-reset, disabled buttons, account creation validation, and pagination edge states remain clear.
