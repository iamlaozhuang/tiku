# 2026-07-01 AI 出题 / AI 组卷资料支撑走查执行方案

## 任务边界

- 任务 id：`ai-generation-data-backed-walkthrough-2026-07-01`
- 分支：`codex/ai-generation-data-backed-walkthrough`
- 目标：在本地 dev 范围内确认是否存在可用的脱敏资料包，并形成一套可支撑 AI 出题 / AI 组卷走查的数据准备与验证路径。
- 本任务默认先做资源包发现、状态计数、导入可行性判断、必要的本地 DB 安全预检；不修业务源码，不改 schema/migration/seed，不改依赖，不部署。

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-central-repair-approval.md`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-root-cause-and-reuse-protocol.md`

## 操作策略

1. 只在本地 `dev` 范围内工作，不连接 staging/prod/cloud。
2. 先发现 D 盘资源包候选路径，只记录路径级摘要、文件类型计数、体量区间和可用性判断，不记录完整教材、题文、试卷、resource/chunk 内容。
3. 先做本地 DB 安全预检：确认目标为本地库、确认现有脚本/命令的 dry-run 或只读能力，避免原始行、内部 id、账号标识进入 evidence。
4. 只有当现有项目机制提供安全导入路径时，才执行导入；若需要新增导入脚本、schema、seed 或迁移，停止并拆分后续任务。
5. 导入后只记录状态计数：profession、level、subject、knowledge_node、question、paper/material/resource 覆盖是否足够支撑走查。
6. 本任务不执行真实 Provider；真实 Qwen 小样本留给 `ai-generation-real-provider-sample-2026-07-01`。

## 允许文件

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-01-ai-generation-data-backed-walkthrough.md`
- `docs/05-execution-logs/evidence/2026-07-01-ai-generation-data-backed-walkthrough.md`
- `docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-data-backed-walkthrough.md`

## 只读/执行边界

- 可只读扫描 D 盘资源包候选路径的文件名、扩展名、大小和目录结构。
- 可只读检查项目现有脚本、package scripts、文档化 DB reset/import 命令。
- 可执行本地 DB dry-run、状态计数、资源导入或 reset，仅限已通过本任务安全预检的本地 dev 目标。
- 不读取或输出环境文件值、连接串、账号密码、cookie/session/localStorage、Authorization header。

## 验证命令

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-data-backed-walkthrough.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-data-backed-walkthrough.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-data-backed-walkthrough.md
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-data-backed-walkthrough-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-data-backed-walkthrough-2026-07-01 -SkipRemoteAheadCheck
```

## 退出标准

- 资源包候选可用性形成脱敏结论：usable / partially_usable / blocked。
- 本地数据准备路径形成结论：import_executed / dry_run_only / blocked_requires_follow_up。
- 覆盖矩阵形成状态计数摘要，不记录原文内容。
- 若执行导入或 reset，evidence 只记录命令类别、目标为本地 dev 的确认、状态计数和脱敏结果。
- 不声明 release readiness、final Pass、生产可用或 Cost Calibration 结论。

## 执行结论

- 资源包候选可用性：`partially_usable`。
- 本地数据准备路径：`dry_run_only`。
- 阻塞点：仓库当前没有可复用的 D 盘私有资源包导入契约，不能安全地把资源包批量映射到
  `profession`/`level`/`subject`/`knowledge_node`/`question`/`paper`/`material`/`resource` 覆盖。
- 后续任务：`ai-generation-resource-import-contract-2026-07-01`。
