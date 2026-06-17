# Advanced Organization Analytics Post Query Gateway Composition Task Seeding

## 本地基线

- 工作目录：`D:\tiku`
- 分支：`codex/advanced-organization-analytics-post-query-queue-seeding`
- 基线命令已按要求顺序执行并通过：
  - `git switch master`
  - `git fetch --prune origin`
  - `git status --short --branch`
  - `git rev-parse HEAD master origin/master`
  - `git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex`
- 起始 SHA：`b50fdd9d99745327434bf4afd3b1aeecab9a4df8`

## 已读取规范与状态

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- 只读上下文：
  - `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd.md`
  - `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-dashboard-summary-runtime-composition-contract-tdd.md`
  - `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-postgres-repository-factory-boundary-tdd.md`
  - `src/server/repositories/organization-analytics-repository.ts`
  - `src/server/services/organization-analytics-route.ts`
  - `src/server/services/organization-analytics-service.ts`
  - `src/app/api/v1/organization-analytics/dashboard-summary/route.ts`

## 当前队列事实

- `task-queue.yaml` 当前没有 `status: pending`。
- 先前建议的 `advanced-organization-analytics-dashboard-summary-route-runtime-wiring-tdd` 已存在且关闭，不能重复补种。
- 最新关闭任务 `advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd` 增加了 injected answer source gateway，但该 gateway 不提供可见组织 scope，且没有 route runtime 或真实 DB wiring。

## 本任务范围

- 只做 docs/state queue seeding。
- 不修改产品源码，不执行 DB，不运行 dev server/e2e/browser，不改 schema/drizzle/package/lockfile。
- 追加一个新的 pending 任务：`advanced-organization-analytics-postgres-gateway-visible-scope-composition-tdd`。
- 该 pending 任务限定为 repository 边界 TDD：组合可见组织 scope reader 与 training answer source reader 为完整 gateway，不进入 route runtime、service、DB/schema 或 UI。

## 验证命令

```powershell
Select-String -Path docs/04-agent-system/state/task-queue.yaml -Pattern "advanced-organization-analytics-post-query-gateway-composition-task-seeding","status: closed","advanced-organization-analytics-postgres-gateway-visible-scope-composition-tdd","status: pending","src/server/repositories/organization-analytics-repository.ts","src/server/repositories/organization-analytics-repository.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-post-query-gateway-composition-task-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-post-query-gateway-composition-task-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-post-query-gateway-composition-task-seeding
```

## 停止条件

- 如果需要改产品源码、schema、drizzle、package/lockfile、`.env*`、scripts 或访问外部服务，立即停止。
- 如果 closeout readiness 或 pre-push readiness 不通过，停止并汇报。
