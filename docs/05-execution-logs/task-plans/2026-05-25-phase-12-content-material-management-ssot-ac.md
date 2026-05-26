# Phase 12 Content Material Management SSOT AC

## 任务

- TaskId: `phase-12-repair-content-material-management-ssot-ac`
- Branch: `codex/phase-12-content-material-management-ssot-ac`
- SourceStory:
  - `docs/01-requirements/stories/epic-02-question-paper.md#us-02-06`
  - `docs/01-requirements/stories/epic-06-admin-ops.md#content-material-management`

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/02-architecture/interfaces/phase-11-staging-resource-plan.md`
- `docs/02-architecture/interfaces/phase-11-staging-secret-and-env-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## 范围

本任务只修复现有 schema/API 可支撑的材料库管理 UI 与本地验证：

- 材料新建/编辑表单暴露并提交 `profession`、`level`、`subject`。
- 材料正文执行 SSOT 30000 字符上限的前端阻断。
- 材料正文提供本地图片占位与表格模板插入入口，不创建真实存储 URL。
- 锁定材料在 UI 中保持 copy-only，不允许直接编辑。
- 更新单测、E2E 兼容性和 evidence。

## 风险边界

- 不改 `package.json`、lockfile、依赖。
- 不改 `.env.local`、`.env.example`，不读取或输出 secret。
- 不改 schema、migration、script。
- 不连接 staging/prod，不部署，不创建云资源或公开对象存储 URL。
- 不记录完整教材、完整试卷、OCR 全文、raw prompt、raw provider payload 或 raw model response。
- 材料被引用的题目/试卷列表如果当前 runtime DTO/API 未提供，只记录为服务契约边界，不伪造数据。

## TDD 与验证计划

1. RED: 在 `tests/unit/admin-question-material-ui.test.ts` 添加材料管理 AC 失败测试。
2. GREEN: 修改 `AdminQuestionMaterialManagementClient.tsx` 的材料表单和材料列表行为。
3. 验证:
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-content-material-management-ssot-ac`
   - `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts src/server/services/material-service.test.ts`
   - `npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts`
   - `npm.cmd run build`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
   - `git diff --check`
