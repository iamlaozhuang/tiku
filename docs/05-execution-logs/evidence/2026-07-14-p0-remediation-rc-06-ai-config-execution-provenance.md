# P0 RC-06 AI 配置、任务执行与结果真实性证据

status: in_progress

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

## Requirement Mapping Result

- stable SSOT、最新 traceability、AI baseline recovery、九角色 catalog、原始 finding 与当前代码已按来源层级和时间序核对。
- 未发现无法消解的需求冲突；Provider/secret/database/runtime 权限边界保持阻断。
- implementation target：governed config/secret adapter、durable scoring task/provenance、honest unavailable、super/ops 治理入口。

## Baseline Recovery

- source branch/HEAD：`master` / `f3af180ee9be32ec8d74ef3a297ed4bf2072dc0e`
- RC-06 branch/worktree：`codex/p0-rc-06-ai-config-execution-provenance` / `D:\tiku\.worktrees\p0-rc-06`
- `master...origin/master`：`0 0`
- live remote `refs/heads/master`：`f3af180ee9be32ec8d74ef3a297ed4bf2072dc0e`
- RC-05 worktree/short branch：absent / absent
- audit：`feat/calibration` / `a84224fa12ec85b28e6acd945deba2afa28c6c02` / clean / `git fsck --no-dangling` pass
- RC-06 baseline full unit：`387/387` files、`2289/2289` tests passed，`388.36s`

## Revalidation

| finding | status           | evidence summary                                                                                                                                                     |
| ------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-0062  | baseline_changed | RC-04/05 changed mock/student services, but default answer-length scoring, missing persistent queue/timeout and split retry remain                                   |
| F-0101  | confirmed        | governance component still has no production route/menu                                                                                                              |
| F-0102  | confirmed        | secret input is discarded to last4/configured; no secret writer/resolver; runtime remains local_mock/env split; connection test is synthetic success without adapter |
| F-0134  | root_cause_alias | retrieval baseline changed, but practice/mistake fixed prose, length score and fake provenance remain; alias F-0062 is not duplicate/resolved                        |

## Approval Boundary

- schema/migration source authoring、static test、commit：approved by current user。
- local commit、ff-only master merge、origin/master push、post-sync cleanup：standing task authorization。
- database apply/read/write、secret/env、Provider/model request、worker activation、runtime/browser/e2e：blocked。
- dependencies、PR、force push、deployment、Cost Calibration：blocked。

## Validation Log

- `corepack pnpm exec vitest run src/db/schema/ai-rag.test.ts tests/unit/p0-rc-06-schema-migration-source.test.ts --reporter=dot`：`2/2` files、`37/37` tests passed。
- `corepack pnpm typecheck`：passed。
- migration source：`drizzle/20260715200303_p0_rc_06_ai_scoring_task.sql`；Drizzle snapshot `0027` 与 journal entry `27` 已生成。
- migration source 仅经 schema/static test 验证；未设置真实 `DATABASE_URL`、未连接或读取数据库、未执行 migrate/apply/push/backfill/seed。

## RED / GREEN

- RED：schema export `aiScoringTask` / `aiScoringTaskStatusValues` 不存在；RC-06 migration source 数量为 `0`，`6` 个预期测试失败。
- GREEN：新增 durable FIFO `ai_scoring_task`、固定 `max_attempt_count=3`、`timeout_second=60`、answer FK、idempotency/FIFO/lease indexes 以及 model/prompt/input/authorization snapshots；`37/37` 通过。

## Migration Source Isolation

- approval：`docs/05-execution-logs/acceptance/2026-07-15-p0-remediation-schema-migration-source-approval.md`，用户再次确认“批准审批请求”。
- staged scope：schema、schema test、migration SQL、Drizzle snapshot/journal、migration static test 与本 evidence；不夹带 UI、secret adapter、connection adapter 或其他业务实现。
- compatibility：只新增 enum/table/index/FK/check，不改写或删除现有列与数据；数据库应用及数据兼容运行时验收仍未获批。

## Review Log

- root cause/diff/security/transaction：pending
- cross-role/state/API/P1-P2 regression：pending

## P1/P2 Impact Mapping Only

- potentially covered：F-0021、F-0038、F-0039、F-0063、F-0091、F-0105、F-0150、F-0156、F-0160、F-0174、F-0177、F-0178。
- semantic change：F-0103、F-0104。
- all deferred to post-P0 revalidation; no finding closed or downgraded here.

## Non-Actions

- 未修改或执行数据库；未读取真实 secret/env；未调用 Provider；未激活 worker。
- 未执行 runtime/browser/e2e；未修改依赖/package/lockfile；未创建 PR、force push 或部署。
- 未修改 `D:\tiku-readonly-audit` 或原始 finding 状态；未进入 RC-07/P1/P2。

localFullLoopGate: pending
