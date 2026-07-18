# P1 RC-02 redeem_code 长期可兑换设计任务方案

日期：2026-07-18

任务：`p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`

分支：`codex/p1-rc02-redeem-code-nullable-deadline`

工作树：`D:/tiku/.worktrees/p1-rc02-redeem-code-nullable-deadline`

## 目标

在不写产品代码、不执行数据库操作的前提下，物化用户已批准的 F-0117 方案 A：`redeem_code.redeem_deadline_at` 改为可空，`null` 表示长期可兑换。关闭 F-0116 状态并建立 F-0117 WIP=1 设计阶段；书面规格提交后等待用户复核，再编制实现计划。

## 已读取规范

- `AGENTS.md`、品味十诫、ADR-001 至 ADR-007、requirement SSOT reading governance。
- 标准/高级版需求索引、用户授权 module/story、advanced ops authorization/quota module/story、edition-aware authorization requirements。
- `2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`、ops authorization UI/UX contract。
- F-0117 finding ledger、post-P0 map、P1 root-cause cluster、当前 schema/migration/contracts/services/repositories/UI/tests。

## 精确设计阶段范围

本提交只允许：

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- 本 task plan、evidence、audit
- `docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-redeem-code-nullable-deadline-authorization.md`
- `docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md`

产品源码、测试、migration 源码与实现计划在用户复核书面规格前必须零 diff。

## 实施顺序

1. 将 F-0116 从 `ready_for_closeout` 转为 `closed`，补齐五项 closeout checkpoint。
2. 物化 F-0117 design-stage task，固定 branch/worktree、allowedFiles、blockedFiles、验证命令与 stop conditions。
3. 记录 fresh approval：方案 A；仅批准 schema/migration source；禁止数据库执行。
4. 写入全链 nullable 规格与 RED 矩阵，执行两轮对抗式自审。
5. 运行 P1 transition、P0、Module pre-commit，提交并通过真实 pre-push transition-only topology。
6. 等待用户复核已提交规格；复核前不调用 writing-plans、不写产品代码。

## 风险防御

- `null` 是唯一长期可兑换语义，禁止远未来哨兵或 UI-only 标志。
- omitted/显式 `null` 输入均表示长期可兑换；非空畸形日期必须 fail-closed。
- 未使用且 deadline 为 `null` 的卡密永不因时间变为 expired；筛选、排序、preview version 与 UI 必须显式覆盖。
- 迁移只生成可审查源码与 snapshot/journal；禁止 `migrate`、`push`、SQL 执行、backfill、seed 或数据库连接。
- 其他 `in_progress` SHA drift 继续 hard-block；ancestor checkpoint 只接受已通过 transition-only 的治理提交。

## Stop Conditions

- transition guard 未识别精确 state/queue 拓扑；
- 书面规格复核未获用户批准；
- 需要真实数据库、backfill、seed、依赖、Provider、browser/runtime、P2、PR、force-push 或 deploy；
- 需要修改 allowlist 外产品文件或其他 finding；
- nullable 迁移无法由可审查源码表达而必须先触碰数据库。

## 验证命令

- 8-file / 66-test 当前聚焦 baseline。
- `git diff --check`
- `Test-P1RemediationSerialProgram.ps1 -Phase pre_commit/pre_push`
- `Test-P0RemediationGlobalBaseline.ps1`
- `Test-ModuleRunV2PreCommitHardening.ps1`
- 书面规格复核后另行编制产品 RED→GREEN、full regression、build 与 closeout 验证计划。
