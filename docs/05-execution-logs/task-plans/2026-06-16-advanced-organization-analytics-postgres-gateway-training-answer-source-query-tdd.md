# Advanced Organization Analytics Postgres Gateway Training Answer Source Query TDD

## 本地基线

- 工作目录：`D:\tiku`
- 起始基线已按治理要求确认：`master`、`HEAD`、`origin/master` 一致，工作区 clean，且无本地/远端 `codex/*` 残留。
- 短分支：`codex/advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd`
- Fresh user approval：用户在本轮明确回复“批准执行”，仅用于领取并实现本 pending 任务；验证后提交/合并/推送仍需 fresh approval。

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- 只读边界文件：
  - `src/db/schema/organization-training.ts`
  - `src/db/schema/auth.ts`
  - `src/server/models/organization-analytics.ts`
  - `src/server/services/organization-analytics-service.ts`

## 任务边界

- 仅实现 organization analytics repository/query 边界的 metadata-only `organization_training_answer` official submission 聚合映射。
- 允许修改：
  - `src/server/repositories/organization-analytics-repository.ts`
  - `src/server/repositories/organization-analytics-repository.test.ts`
  - 本 task plan、evidence、audit/review
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
- 明确不做：
  - route runtime wiring
  - service/repository 外层调用改造
  - UI、DB schema、migration、drizzle、dependency、provider/model、e2e/browser/dev-server
  - 真实数据库连接或外部服务访问
  - raw row data、private data、publicId 列表、provider payload/raw prompt/raw answer 暴露

## TDD 执行思路

1. RED：在 `organization-analytics-repository.test.ts` 增加 focused unit test，要求 answer source gateway：
   - 对 scope input 做同现有 repository 一致的 trim/dedupe 规范化。
   - 只接收 aggregate-only official answer source rows。
   - 将 rows 映射为既有 `readTrainingAggregateMetricsInput` contract。
   - 过滤跨 scope、空 employee public id、非法 score/totalScore/submittedAt。
   - 不泄露 raw/private/detail 字段或 answer public id。
2. GREEN：在 `organization-analytics-repository.ts` 增加最小 factory/helper：
   - 由注入 reader 提供 source rows，不执行真实 DB 连接。
   - 返回 `OrganizationAnalyticsRepositoryGateway`，只提供本任务需要的 training aggregate 映射，其余 read paths fail-closed/empty。
   - 保持 immutable copy 和 summary-only/aggregate-only 裁剪风格。
3. REFACTOR：只在本文件内部抽取必要的 sanitize/coerce helper，不新增依赖，不修改跨层 contract。

## 验证命令

按任务声明执行：

```powershell
npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd
```

## 停止条件

- 如需超出 allowedFiles/blockedGates，立即停止并汇报。
- 验证完成后停止，等待 fresh approval；本任务当前 closeoutPolicy 不允许自动 local commit、FF merge 或 push。
