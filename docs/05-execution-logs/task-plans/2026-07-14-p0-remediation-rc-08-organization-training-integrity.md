# P0 RC-08 企业训练完整性整改方案

status: implementation_complete_pending_closeout

taskId: `p0-remediation-rc-08-organization-training-integrity-2026-07-14`

branch: `codex/p0-rc-08-organization-training-integrity`

worktree: `D:\tiku\.worktrees\p0-rc-08`

## 目标与边界

- WIP=1，仅处理 F-0121、F-0123、F-0145。
- 修复服务端 canonical `organization_training` draft/version/answer aggregate、发布原子性与幂等、服务端评分事实及 analytics 消费边界。
- P1/P2 只记录影响映射，不关闭、不降级、不顺手实现；21 项 runtime validation 不执行。
- 不连接/读取/修改数据库，不执行 migration apply/backfill/seed；不读取真实 secret/env，不调用 Provider，不激活 worker，不执行 browser/e2e/runtime acceptance。
- 不新增、删除或升级依赖；不创建 PR、不 force push、不部署；不修改 `D:\tiku-readonly-audit`。

## 已读取基线

- `D:\tiku\AGENTS.md`、品味十诫、ADR-001 至 ADR-007。
- `docs/04-agent-system/state/project-state.yaml`、`task-queue.yaml`、串行 Program、standing authorization、schema/migration source approval、RC-07 plan/evidence/audit。
- requirements 根索引、高级版索引、edition-aware authorization requirements、组织训练/统计/组织 AI module 与 story、2026-07-02 组织训练 UI/UX contract、角色授权训练决策包、全角色 UI/UX 实现入口。
- AI generation SSOT/Phase 4/closed-loop/recontract/current acceptance baseline，确认旧 blocked/gap 未覆盖当前 P0。
- 审计 finding register 中 F-0121/F-0123/F-0145、AP-OO-004/AP-FL-004、SM-ORG-TRAINING-DRAFT/VERSION/ANSWER/VALIDATION、DEP-039/DEP-046/DEP-022、RV-0020。
- 当前 organization training schema/model/contract/validator/mapper/service/route/repository、管理端/员工端 UI、analytics repository 及测试；RC-06/RC-07 durable scoring/transaction/idempotency 类似实现。

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/organization-training.md`
- `docs/01-requirements/advanced-edition/modules/organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/organization-ai.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/02-architecture/adr/ADR-007-edition-aware-authorization.md`
- `docs/03-standards/code-taste-ten-commandments.md`

## 基线恢复

- 起点：`master` / `origin/master` / 实时远端均为 `78da56891d82883de2384438b03c6ab4d4444cfd`，根工作区 clean。
- RC-07 business/schema/docs 已提交、合入和 push；旧 worktree/短分支均已清理。领取 RC-08 时将 state/queue 中 RC-07 从 `ready_for_closeout` 校准为 `closed`，closeout checkpoints 全部置 `pass`。
- RC-08 worktree/branch 起点同上；依赖通过 offline frozen lockfile 恢复，未修改 package/lockfile。
- baseline full unit：`397/397` files、`2370/2370` tests passed，`--maxWorkers=4`。
- audit repository：`feat/calibration` / `a84224fa12ec85b28e6acd945deba2afa28c6c02` / clean；本任务保持只读。

## 当前复验

| finding | 领取状态                            | 当前失败事实                                                                                                                                                              |
| ------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-0121  | baseline_changed                    | RC-02/03/04/05/06/07 已改变授权、快照、证据和评分上游，但 publish 仍不读取目标 draft，仍接受客户端 questions/evidence/count/score 汇总作为版本真值。                      |
| F-0123  | baseline_changed + root_cause_alias | 与 F-0121 共享缺失 canonical aggregate；同一 draft 仍可顺序重复发布，并发仍先读 latest version 再争用唯一键，draft 无消费状态/revision/idempotency。                      |
| F-0145  | baseline_changed                    | RC-03/06/07 已改变授权和正式评分链，但 enterprise training submit 仍接受客户端 answeredQuestionCount/scoreSummary，question result 固定 0，analytics 继续消费该提交分数。 |

baseline_changed 不表示问题消失；三项均保持 P0 且需独立结论。

## 第一性原理不变量

1. `draft` 是可恢复、可条件保存、可丢弃/消费的服务端聚合；客户端只能提出编辑命令，不能声明发布事实。
2. `publish` 只读取指定 organization/authorization 下、状态为 draft、revision 匹配的服务端快照；一次事务完成锁定、版本插入、draft 消费和幂等结果记录。
3. 每个 draft 最多产生一个不可变 published version；后续修改只能 copy-to-new-draft。
4. evidence/citation 结论来自服务端已持久来源或服务端降级规则；客户端不能把 `none/weak` 自行抬升为 `sufficient`。
5. 员工只提交 version、expectedRevision、operationId 与 answerItems；answered count、总分、逐题分和 analytics 输入均由服务端快照计算。
6. 每题只出现一次，option 必须属于对应题目，题型与答案形状一致；submit 要求全部题目已答。
7. 客观题同步计算；含 `short_answer` 的提交先成为 `scoring`，同事务建立 durable scoring task，Provider 未完成前不得伪造最终分数或进入 analytics。
8. 同一员工/版本只允许一次正式提交；同 operation 重放返回同一结果，不同 operation、stale revision 或并发首提明确 conflict。
9. scoring task 必须有不可变 input/authorization/model/prompt/RAG provenance、claim lease、3 次有界重试、timeout、失败与完成收敛；本任务只实现 source/test，不激活 worker。
10. organization training 不写 formal `practice`、`mock_exam`、`answer_record`、`exam_report` 或 `mistake_book`。

## 实现顺序（TDD）

1. RED：新增 RC-08 focused 与 migration-source tests，证明当前 publish 绕过 draft、重复/并发发布、伪分/非法 option/空答案满分、主观题无 task、analytics 污染。
2. Schema source：draft status/revision/canonical question snapshot/save operation；version draft FK/单次 publish/idempotency；answer revision/save/submit operation/scoring 状态；organization-training 专属 durable scoring task。生成 additive Drizzle SQL、snapshot、journal，只做静态验证。
3. Contract/validator：新增 draft-save；publish 移除 questions、evidence、metadata 汇总等不可信字段；employee save/submit 移除 answeredQuestionCount/scoreSummary并要求 expectedRevision/operationId。
4. Service：服务端规范化 canonical draft；受信来源 evidence 保留，手工/被编辑题目降级为 weak，source `none` 保持阻断；按 snapshot 校验 answer shape、完整性并计算客观题结果。
5. Repository：条件保存；事务性 publish consume/idempotent replay/conflict；答案 save/submit monotonic revision 与同 operation replay；含 short_answer 时同事务 enqueue durable task；task claim/recover/complete/fail 与 answer/analytics 终态收敛。
6. Route/UI：按服务端 draft 加载 authorization lineage；管理端先 save canonical draft 再 publish；员工端只发 answerItems/revision/operationId，并显示 scoring/failed 状态；不暴露 standard answer、原始 AI IO 或内部 id。
7. Analytics：仅接受 `submitted` 且 score 与逐题 terminal result 一致的服务端答案；`scoring/scoring_failed` 排除。
8. GREEN 后执行 focused、全量单测、lint/typecheck/format/build/diff/serial guard/Module Run gates。
9. 两轮自对抗复核：Round 1 根因/diff/事务/越权/幂等/数据兼容；Round 2 跨角色/状态机/API/analytics/P1P2/隐私/反向破坏。未经 Subagent 批准，不表述为独立审查者。

## 数据兼容策略

- 全部 schema 变化 additive；历史 draft 默认 `draft`、revision=1、question snapshot=[]，不会被自动视为可发布。
- 历史 version 保留 draft_public_id；仅能无歧义关联时填充 FK，migration source 不执行数据回填。新写入强制 FK/单 draft 单 version。
- 历史 answer 默认 revision=1；既有 submitted 成绩不重算、不改写、不进入本任务的批量修复。新提交走服务端评分事实。
- 旧 metadata-only draft 在保存前由受权 source resolver 恢复来源快照；无法恢复时 fail closed，不由客户端补造 evidence。

## 精确源码范围

- governance：project-state、task-queue、本 plan/evidence/audit、P0 finding ledger。
- schema：`src/db/schema/organization-training.ts`、对应 test/index、RC-08 additive drizzle SQL/snapshot/journal 与 migration-source test。
- domain：organization-training model/contract/validator/mapper/service/route/repository 及对应 tests；专属 scoring task repository/runtime source/test（如实现所需）。
- API/UI：`src/app/api/v1/organization-trainings/**`、admin/student organization training page 与入口静态 tests。
- analytics：仅 organization analytics repository/test 中“只消费可信 terminal score”边界；不扩展统计产品功能。

## 验收契约

- 正常：manual/source draft 条件保存；sufficient 或已确认 weak 发布；客观题全对/全错/混合评分；short_answer enqueue 后等待 terminal。
- 越权：不存在、跨 organization、错 authorization、standard edition、不可见子组织、他人 answer/task 均 fail closed，且不泄漏存在性。
- 状态：discarded/consumed/stale draft 不发布；taken_down/deadline 后不保存/提交；submitted/scoring/scoring_failed 不可二次正式提交。
- 并发/幂等：同 publish/submit operation 重放返回同对象；同 key 异参、不同 key 重复、stale revision、并发首次写只有一个权威结果。
- 事务失败：version/draft、answer/task、task/answer completion 任一步失败全部回滚。
- 输入：null、空集合、重复题、重复 option、非法 option、错误题型答案、缺题、边界 score/revision/timestamp 拒绝。
- 契约：JSON camelCase、标准 envelope、null/[]、public id；移除客户端 score/count/evidence authority，前后端枚举一致。
- 回归：org_advanced_admin/employee、organization analytics、platform paper/organization AI handoff、authorization scope、RC-06/07 scoring provenance。
- runtime：RV-0020 保持 pending；database/browser/Provider/worker activation 未授权。

## 验证命令

- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.ps1 -Phase manual`
- `corepack pnpm@10.15.1 exec vitest run tests/unit/p0-rc-08-organization-training-integrity.test.ts tests/unit/p0-rc-08-schema-migration-source.test.ts --reporter=dot`
- organization-training/analytics focused schema-validator-mapper-service-route-repository/UI tests
- `corepack pnpm@10.15.1 exec vitest run --maxWorkers=4 --reporter=dot`
- `corepack pnpm@10.15.1 run lint`
- `corepack pnpm@10.15.1 run typecheck`
- `corepack pnpm@10.15.1 run format:check`
- `corepack pnpm@10.15.1 run build`
- Module Run v2 pre-commit/module-closeout/pre-push scripts for RC-08。

## 暂停条件

- requirement SSOT 出现无法按时间序/来源层级消解的冲突。
- 需要依赖、数据库执行/读取/回填、真实 secret/env、Provider、worker activation、runtime/browser/e2e、PR/force/deploy。
- 新发现必须改变已批准业务边界，或无法形成独立可审查提交。

当前 schema/migration 源码编写、测试和提交已获用户批准；上述暂停条件出现前持续推进。

## 实现结果

- canonical draft 保存、受信 evidence 保留/编辑降级、事务性单次发布、revision 与 operation id 重放已落地。
- 员工请求不再提交 count/score；服务端按不可变题目快照校验并评分，short_answer 同事务建立 durable scoring task。
- scoring task 的 canonical 逐题基线、model/prompt/RAG/authorization provenance、lease、3 次重试、60 秒 timeout、恢复、完成和失败收敛已实现；worker 未激活。
- 两轮不同重点的同 Agent 对抗式复核已完成；发现的 evidence 降级、过期 worker 回写和 service 层阻断幂等重放问题均在本任务内修复并回归。
- 最终聚焦测试 `11/11` files、`198/198` tests；最终全量分片等价执行 `400/400` files、`2386/2386` tests；lint/typecheck/format/build 通过。
- 当前停止在 business commit/ff-only merge/fresh master closeout 之前；RV-0020、数据库、Provider、worker、browser/runtime acceptance 仍未执行。
