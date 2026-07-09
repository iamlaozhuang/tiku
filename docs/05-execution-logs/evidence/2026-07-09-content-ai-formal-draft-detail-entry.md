# 2026-07-09 content AI formal draft detail entry evidence

## Scope

- Task id: `content-ai-formal-draft-detail-entry-2026-07-09`
- Branch: `codex/content-ai-formal-draft-detail-entry`
- Scope: content-admin AI generation history public-id entry to formal question/paper draft detail pages.
- Out of scope: publish logic, Provider execution, DB connection/mutation, schema/migration/seed, dependencies, package/lockfile, browser screenshots, staging/prod/deploy, env/secret/Cost Calibration.

## Requirement Mapping Result

- AI 出题采纳后进入正式草稿详情: implemented as a `questionPublicId` query entry from content-admin AI history to the formal question management page.
- AI 组卷采纳后进入正式草稿详情: implemented as a `paperPublicId` query entry from content-admin AI history to the formal paper management page.
- 已创建草稿: shows an enabled public-id entry to the corresponding content-admin formal draft surface.
- 已通过但草稿待创建: shows disabled safe copy; no navigation target is emitted.
- 已驳回 / 未通过发布前置状态: shows disabled safe copy; no navigation target is emitted.
- Missing target on destination page: shows a safe not-found message by public id only.
- Formal publish behavior: unchanged.

## Redacted Implementation Evidence

- `AdminAiGenerationEntryPage`: added content-admin formal draft detail entry model and UI panel.
- `AdminQuestionMaterialManagement`: accepts `initialQuestionPublicId`, defaults to question view, opens the matching edit context through derived UI state, and hides the derived target when dismissed or switching to material view.
- `AdminPaperManagement`: accepts `initialPaperPublicId`, initializes the keyword filter from the public id, and highlights the matching paper row.
- Content routes pass only public-id query parameters to the relevant management surfaces.
- Tests added for question entry, paper entry, approved-but-not-created disabled state, question destination entry, and paper destination entry.

## TDD / Validation

- Red phase:
  - Focused AI history tests failed before implementation because formal draft detail links and safe waiting state were absent.
  - Destination page tests failed before implementation because `questionPublicId` / `paperPublicId` query targets were not consumed.
- Green phase:
  - `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts --reporter=dot`
    - Result: pass, 3 files / 79 tests.
  - `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx --reporter=dot`
    - Result: pass, 2 files / 51 tests.
  - `corepack pnpm@10.26.1 exec vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
    - Result: pass, 5 files / 150 tests.
  - `corepack pnpm@10.26.1 run typecheck`
    - Result: pass.
  - `corepack pnpm@10.26.1 run lint`
    - Result: pass after replacing the initial synchronous effect state update with derived UI state.
  - `git diff --check`
    - Result: pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-formal-draft-detail-entry-2026-07-09`
    - Result: pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-formal-draft-detail-entry-2026-07-09 -SkipRemoteAheadCheck`
    - Result: pass.

## Sensitive Boundary

- No credentials, session, cookie, token, localStorage value, Auth header, env value, DB URL, raw DB row, internal numeric id, Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk, screenshot, trace, or raw DOM recorded.
- No DB access or mutation executed.
- No Provider-enabled execution.
- No dependency/package/lockfile change.
