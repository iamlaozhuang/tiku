# Evidence: Phase 12 Content Question Edit UX

## Task

- id: `phase-12-repair-content-question-edit-ux`
- branch: `codex/phase-12-content-question-edit-ux`
- source: Phase 12 SSOT audit repair queue
- status: closed pending commit/merge closeout

## Boundary

- No staging/prod access.
- No deployment.
- No cloud resource, public object storage URL, Tencent COS, DNS, ICP, server, or database change.
- No dependency, package, lockfile, schema, migration, or script change.
- No `.env.local` secret read/output/copy.
- No real AI provider call in this task.
- Evidence excludes raw prompt, raw answer, raw model response, raw provider payload, Authorization header, token, secret, full教材/试卷/OCR全文, and customer-like private data.

## Implementation Summary

- Moved question/material create-edit forms from the detached top-of-page position into an adjacent contextual edit panel beside the active list.
- Added selected-row state through `data-selected`, `aria-current`, and visual ring styling.
- Added stable test ids for question edit actions and the contextual edit panel.
- Preserved existing create/edit/disable/copy runtime wiring and schema-supported question-type form controls.
- Extended unit and E2E coverage for the selected-row-to-edit-panel behavior.

## Findings Closed

- P3: content question edit UX previously filled a detached form above the list, making it hard to understand which row was being edited.

## Validation

- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-content-question-edit-ux`
- PASS: `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`
  - Result: 1 file passed, 10 tests passed.
- PASS: `npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts`
  - Result: 1 Chromium test passed.
- PASS: `npm.cmd run build`
  - Result: Next.js production build completed successfully; 47 static pages generated.
- PASS: Browser rendered validation on `http://localhost:3000/content/questions`
  - Page identity: URL `/content/questions`, title `题库系统 - 烟草行业职业技能考试平台`.
  - Interaction proof: clicked a question edit action; selected row reported `data-selected=true`; contextual panel label was `编辑题目`.
  - Console health: 0 warning/error entries during the verified flow.
  - Screenshot: captured in Codex Browser output for this run; no raw full content copied into evidence.
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- PASS: `git diff --check`

## Repository Hygiene Closeout Checklist

- Task plan created: yes.
- Evidence created: yes.
- Queue state updated: `phase-12-repair-content-question-edit-ux` closed.
- Project state updated: current task points to this closeout.
- Package/lockfile changed: no.
- Schema/migration/script changed: no.
- Cloud/staging/prod/deploy touched: no.
- Secret/env output: no.
- Raw prompt/answer/model/provider payload in evidence: no.
- Next task: `phase-12-plan-question-type-schema-expansion` gate review; implementation remains blocked without explicit approval.

## 品味合规自检 Checklist

- 命名：继续使用 `question`、`material`、`publicId`、`content` 等项目术语，未新增自造缩写。
- API/DTO：未改 REST 路径或响应结构；前端仍消费既有 camelCase DTO。
- 数据边界：未暴露自增 `id`；测试和 UI 继续围绕 publicId。
- UI 状态：编辑状态有明确上下文面板、选中态和取消/保存操作。
- UI Token：样式使用既有 Tailwind token 类，未引入硬编码颜色或新设计系统。
- React 结构：改动保持在既有组件内，未引入依赖或全局状态。
- 依赖与 schema：未改 package/lockfile、schema、migration、script。
