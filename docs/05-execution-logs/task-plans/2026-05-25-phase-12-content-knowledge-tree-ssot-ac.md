# Phase 12 Content Knowledge Tree SSOT AC

## 任务

- TaskId: `phase-12-repair-content-knowledge-tree-ssot-ac`
- Branch: `codex/phase-12-content-knowledge-tree-ssot-ac`
- SourceStory:
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-10`
  - `docs/01-requirements/modules/05-rag-knowledge.md#knowledge-node-management`

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## 范围

本任务只修复现有 knowledge_node API/DTO 可支撑的本地内容后台知识点树体验：

- 按 `profession` 分组展示知识点树，保留 publicId-only 与内部 id 隐藏。
- 新增/编辑/重命名使用可编辑表单，不再使用固定示例 payload。
- 移动/排序使用可编辑表单，提交 `parentKnowledgeNodePublicId` 与 `sortOrder`。
- 停用仍走二次确认，不提供删除。
- 显示绑定题目数与是否可推荐。
- 更新任务声明的单测、E2E、build 和机制门禁 evidence。

## 风险边界

- 不改依赖、package/lockfile。
- 不改 schema、migration、script。
- 不改 `.env.local`/`.env.example`，不读取或输出 secret。
- 不连接 staging/prod，不部署，不调用真实 provider。
- 不记录 raw prompt、raw answer、raw model response、完整教材、完整试卷、OCR 全文或客户/类客户私密数据。

## TDD 与验证计划

1. RED: 先补 `tests/unit/admin-content-knowledge-ops-baseline.test.ts`，覆盖 knowledge_node 表单化 create/edit/move 与按专业树形展示。
2. GREEN: 修改 `src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx`。
3. 验证:
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-content-knowledge-tree-ssot-ac`
   - `npm.cmd run test:unit -- tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/phase-11-knowledge-node-tree-management-loop.test.ts`
   - `npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts`
   - `npm.cmd run build`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
   - `git diff --check`
