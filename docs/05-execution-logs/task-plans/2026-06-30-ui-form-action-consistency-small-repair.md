# 2026-06-30 UI Form Action Consistency Small Repair

## 任务

- Task ID: `ui-form-action-consistency-small-repair-2026-06-30`
- Branch: `codex/ui-form-action-consistency-small-repair-20260630`
- Scope: perform one low-risk UI form action consistency repair from the static inventory.
- Expected implementation: add dynamic submitting labels to organization training form action buttons and cover the behavior with the existing focused unit surface test.

## 已读取并遵守的规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest UI/UX static inventory task plan and evidence.
- Latest UI state feedback repair task plan, evidence, audit, and acceptance.

## 技能适用性说明

- `build-web-apps:frontend-testing-debugging` applies because this is a focused frontend repair.
- Browser, dev-server, screenshot, raw DOM, and trace paths remain blocked by the queued task boundary.
- `superpowers:test-driven-development` applies: add a focused failing assertion for submitting action copy before source changes, then implement the minimal source repair.

## 可写边界

Only these files may be modified:

- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-ui-form-action-consistency-small-repair.md`
- `docs/05-execution-logs/evidence/2026-06-30-ui-form-action-consistency-small-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-ui-form-action-consistency-small-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-30-ui-form-action-consistency-small-repair.md`

## 只读复核对象

- `docs/05-execution-logs/evidence/2026-06-30-ui-ux-static-detail-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-30-ui-state-feedback-small-repair.md`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`

## 禁止事项

- No package, lockfile, dependency, database, migration, seed, browser, dev server, e2e, Provider, AI, release, final Pass, Cost Calibration, PR, or force-push work.
- No staging/prod/cloud connections.
- No env, secret, connection string, credential, cookie, token, session, `localStorage`, or `Authorization` header values in evidence.
- No raw DOM, screenshot, trace, raw DB row, internal ID, PII, Provider payload, prompt, raw AI I/O, or full business-content evidence.

## 实施思路

1. Add a focused unit assertion that the organization training create-draft submit button changes to submitting copy while a write request is pending.
2. Run the focused test to confirm the expected RED failure while the button only disables with its normal label.
3. Add dynamic submitting labels to the create draft, bind source, and copy draft form actions.
4. Keep API calls, state transitions, layout tokens, and visual styling unchanged.
5. Run focused unit validation plus governance validation.

## 风险防御

- Keep the repair limited to one source file and one existing unit test file.
- Do not broaden UI surfaces or alter request payloads.
- Do not run browser, dev server, e2e, DB, Provider, AI, dependency, release, deployment, or Cost Calibration commands.

## 验证命令

- `npx.cmd vitest run tests/unit/organization-training-admin-entry-surface.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx tests/unit/organization-training-admin-entry-surface.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-ui-form-action-consistency-small-repair.md docs/05-execution-logs/evidence/2026-06-30-ui-form-action-consistency-small-repair.md docs/05-execution-logs/audits-reviews/2026-06-30-ui-form-action-consistency-small-repair.md docs/05-execution-logs/acceptance/2026-06-30-ui-form-action-consistency-small-repair.md`
- `npx.cmd prettier --check --ignore-unknown src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx tests/unit/organization-training-admin-entry-surface.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-ui-form-action-consistency-small-repair.md docs/05-execution-logs/evidence/2026-06-30-ui-form-action-consistency-small-repair.md docs/05-execution-logs/audits-reviews/2026-06-30-ui-form-action-consistency-small-repair.md docs/05-execution-logs/acceptance/2026-06-30-ui-form-action-consistency-small-repair.md`
- `git diff --check`
- `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env package-lock.yaml package-lock.json`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ui-form-action-consistency-small-repair-2026-06-30`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ui-form-action-consistency-small-repair-2026-06-30`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ui-form-action-consistency-small-repair-2026-06-30 -SkipRemoteAheadCheck`
