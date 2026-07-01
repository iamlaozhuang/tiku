# 2026-07-01 AI 出题 / AI 组卷本地资源导入合同执行方案

## 任务边界

- 任务 id：`ai-generation-resource-import-contract-2026-07-01`
- 分支：`codex/ai-generation-resource-import-contract`
- 目标：新增 dry-run-first 的本地 owner preview 资源包导入合同，让后续 AI 出题 / AI 组卷资料完备走查可以获得 `profession`、`level`、`subject`、`knowledge_node`、`question`、`paper`、`material`、`resource` 的基础覆盖。
- 本任务允许在已物化边界内新增本地脚本、focused unit tests 和执行日志；不改依赖、不改 schema/migration、不改既有 seed 语义、不触发 Provider、不做浏览器角色走查、不部署。

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

## 当前授权固化

- 用户已统一授权读取或导入 D 盘资源包、本地 DB reset/seed/import、浏览器多角色协作走查、真实 Qwen Provider 小样本、必要的 env 手动配置协作、package/lockfile/依赖/schema/migration/seed 改动等高风险类别。
- 本任务只使用其中的本地资源包读取、本地资源导入合同、本地 DB 执行闸门能力。
- 仍不输出、不保存账号密码、完整卡密、cookie、token、session、localStorage、Authorization header、`.env*` 值或 DB 连接串；execute 模式允许脚本按本地运行时读取 DB 目标变量，但不得渲染或记录值。
- 仍不把 raw DB 行、内部自增 id、PII、Provider payload、prompt、raw AI input/output、完整题文/试卷/材料/resource/chunk 内容写入仓库、evidence 或最终汇总。

## 实现策略

1. 采用 TDD：先补 focused unit tests 锁定 dry-run、执行闸门、脱敏输出和聚合计数合同。
2. 新增 `src/db/owner-preview-resource-import.ts`，复用 `owner-preview-empty-baseline.ts` 的本地 DB 保护方式和 CLI 输出风格。
3. 新增 `scripts/db/Import-OwnerPreviewResourcePackage.ps1`，默认 dry-run；`-Execute` 必须同时带确认开关，且仅允许本地 dev 数据库。若当前进程没有 DB 变量，CLI 可从本地 env 文件运行时加载目标变量，但只用于本地目标校验和连接，不输出值。
4. 资源包解析只记录结构化计数和覆盖矩阵：
   - 清单文件计数、结构化文件计数、源文档计数。
   - CSV 题目行数、唯一 `profession` / `level` / `subject` / `knowledge_node` 覆盖数。
   - inventory 中资源元数据行数与覆盖数。
5. 执行写入若启用，只写本地 owner preview 支撑数据；evidence 仅记录聚合计数，不记录 raw DB 行或完整内容。
6. SQL 适配层作为脚本层本地数据准备能力，必须参数化写入、可重复执行、避免破坏 8 角色身份和授权骨架。

## 允许文件

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-01-ai-generation-resource-import-contract.md`
- `docs/05-execution-logs/evidence/2026-07-01-ai-generation-resource-import-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-resource-import-contract.md`
- `tests/unit/owner-preview-resource-import.test.ts`
- `src/db/owner-preview-resource-import.ts`
- `scripts/db/Import-OwnerPreviewResourcePackage.ps1`

## 验证命令

```powershell
npm.cmd run test:unit -- tests/unit/owner-preview-resource-import.test.ts
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-resource-import-contract.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-resource-import-contract.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-resource-import-contract.md tests/unit/owner-preview-resource-import.test.ts src/db/owner-preview-resource-import.ts scripts/db/Import-OwnerPreviewResourcePackage.ps1
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-resource-import-contract-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-resource-import-contract-2026-07-01 -SkipRemoteAheadCheck
```

## 退出标准

- dry-run 可在不连接 DB 的情况下输出脱敏聚合摘要。
- execute 缺少确认参数、本地 DB 校验失败、资源包结构缺失时明确 blocked。
- 输出 guard 能拦截连接串、账号/密码/token/session/cookie、`.env`、PII、Provider payload、prompt/raw AI、public/internal id 等敏感模式。
- 资源导入可重复执行，不破坏现有账号/授权骨架，不改 schema/migration/seed/依赖。
- evidence 只含状态、计数、命令类别和脱敏结论。
- 不声明 release readiness、final Pass、生产可用或 Cost Calibration。
