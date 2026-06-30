# 2026-06-30 UI Token Layout Small Repair

## 任务

- Task ID: `ui-token-layout-small-repair-2026-06-30`
- Branch: `codex/ui-token-layout-small-repair-20260630`
- Scope: perform one low-risk UI token/layout repair from the static inventory.
- Expected implementation: extract the repeated admin resource modal shell into a single local component and cover the source-level layout guard with a focused static unit test.

## 已读取并遵守的规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest UI/UX static inventory task plan, evidence, audit, and acceptance.

## 技能适用性说明

- `build-web-apps:frontend-testing-debugging` was checked because this is a frontend repair.
- Its browser validation path is not used because this queued task explicitly blocks browser runtime, dev server, screenshots, raw DOM, and traces.
- `superpowers:test-driven-development` is applied: write a focused failing static unit test before source changes, then implement the minimal source repair.

## 可写边界

Only these files may be modified:

- `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`
- `tests/unit/admin-resource-knowledge-ui-layout.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-ui-token-layout-small-repair.md`
- `docs/05-execution-logs/evidence/2026-06-30-ui-token-layout-small-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-ui-token-layout-small-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-30-ui-token-layout-small-repair.md`

## 只读复核对象

- `docs/05-execution-logs/evidence/2026-06-30-ui-ux-static-detail-inventory.md`
- `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`
- Existing focused unit-test patterns under `tests/unit/**`

## 禁止事项

- No package, lockfile, dependency, database, migration, seed, browser, dev server, e2e, Provider, AI, release, final Pass, Cost Calibration, PR, or force-push work.
- No staging/prod/cloud connections.
- No env, secret, connection string, credential, cookie, token, session, `localStorage`, or `Authorization` header values in evidence.
- No raw DOM, screenshot, trace, raw DB row, internal ID, PII, Provider payload, prompt, raw AI I/O, or full business-content evidence.

## 实施思路

1. Add a focused static unit test that fails while the repeated admin resource modal shell class remains duplicated.
2. Extract a local `AdminResourceModalShell` component inside `AdminResourceKnowledgeManagement.tsx`.
3. Replace only the repeated same-shell resource dialogs with the local component.
4. Keep visual tokens and behavior unchanged; this is a small de-duplication and layout consistency repair.
5. Run focused unit validation plus governance validation.

## 风险防御

- Keep the repair limited to one source file and one unit test file.
- Do not change modal copy, actions, API calls, data shape, package dependencies, or runtime behavior.
- Do not run browser, dev server, e2e, DB, Provider, AI, dependency, release, deployment, or Cost Calibration commands.

## 验证命令

- `npx.cmd vitest run tests/unit/admin-resource-knowledge-ui-layout.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx tests/unit/admin-resource-knowledge-ui-layout.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-ui-token-layout-small-repair.md docs/05-execution-logs/evidence/2026-06-30-ui-token-layout-small-repair.md docs/05-execution-logs/audits-reviews/2026-06-30-ui-token-layout-small-repair.md docs/05-execution-logs/acceptance/2026-06-30-ui-token-layout-small-repair.md`
- `npx.cmd prettier --check --ignore-unknown src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx tests/unit/admin-resource-knowledge-ui-layout.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-ui-token-layout-small-repair.md docs/05-execution-logs/evidence/2026-06-30-ui-token-layout-small-repair.md docs/05-execution-logs/audits-reviews/2026-06-30-ui-token-layout-small-repair.md docs/05-execution-logs/acceptance/2026-06-30-ui-token-layout-small-repair.md`
- `git diff --check`
- `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env package-lock.yaml package-lock.json`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ui-token-layout-small-repair-2026-06-30`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ui-token-layout-small-repair-2026-06-30`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ui-token-layout-small-repair-2026-06-30 -SkipRemoteAheadCheck`
