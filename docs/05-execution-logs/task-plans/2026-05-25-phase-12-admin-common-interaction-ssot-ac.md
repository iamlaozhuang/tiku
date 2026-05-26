# Phase 12 Admin Common Interaction SSOT AC

## 任务

- TaskId: `phase-12-repair-admin-common-interaction-ssot-ac`
- Branch: `codex/phase-12-admin-common-interaction-ssot-ac`
- SourceStory: `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-01`

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## 范围

本任务只在现有后台本地 UI/API 边界内收口通用交互：

- 列表页默认 20 条，并在相关后台页面暴露 20/50/100 页大小选择。
- 表头或排序按钮支持升序/降序切换。
- 筛选变更触发数据刷新或本地结果重算。
- 危险/批量/关键写操作保留二次确认与明显危险样式。
- 成功/失败 Toast 覆盖可见。
- 不扩张授权模型，不新增数据库并发控制；AC-7 仅记录已有本地 UI/运行时边界和后续服务层原子性缺口。

## 风险边界

- 不改依赖、package/lockfile。
- 不改 schema、migration、script。
- 不改 `.env.local`/`.env.example`，不读取或输出 secret。
- 不连接 staging/prod，不部署，不调用真实 provider。
- 不记录 raw prompt、raw answer、raw model response、完整教材、完整试卷、OCR 全文或客户/类客户私密数据。

## TDD 与验证计划

1. RED: 补充单测覆盖后台内容页共有分页大小、排序切换、筛选刷新、确认与 Toast。
2. GREEN: 修改 `src/features/admin/**` 现有组件，优先复用既有 `FilterSelect`、`Button` 和 Toast/Dialog 模式。
3. 验证:
   - `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts`
   - `npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts`
   - `npm.cmd run build`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
   - `git diff --check`
