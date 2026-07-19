# P1 RC-02 redeem_code 长期可兑换审查

日期：2026-07-18

任务：`p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`

## Transition Disposition

Decision: APPROVE_SCOPE

批准物化用户已批准的方案 A 与 fresh schema/migration source authorization。当前 transition 只关闭 F-0116 checkpoint、切换 F-0117 design-stage WIP，并新增 plan/evidence/audit/authorization/spec；产品、测试、schema 和 migration 必须零 diff。

## Round 1

Result: pass

第一性原理复核确认：需求中的“长期可兑换”是 deadline 缺失的领域状态，不是某个足够远的时间点。数据库 nullable 是必要条件；API 必须显式 null；repository、preview、confirm 和 UI 必须共享同一语义。方案 B 的远未来哨兵与方案 C 的额外布尔值都会制造双重事实或错误过期边界，拒绝采用。

## Round 2

Result: pass

对抗审查覆盖以下失败路径：omitted/null/empty 混淆、`.toISOString()` null crash、expired/unused filter 漏行、DESC 默认 nulls first、preview version 省略 null、confirm 时间比较、UI formatter 崩溃、Drizzle 生成夹带漂移、误运行数据库命令。

规格已精确要求 empty fail-closed、输出 key 不省略、升降序 nulls last、canonical facts 包含 null、额外 schema drift 立即停止、migration source only。`durationDay`、edition、明文分发、审计脱敏与并发模型均保持不变。

## Authorization Audit

Result: pass

fresh approval 文件同时包含 Human approval、任务 id、`schemaMigration` 和禁止数据库执行边界。queue 必须设置：

- `schemaMigration: approved_source_generation_only_no_execution`
- `databaseMutation: blocked_without_fresh_user_approval`
- migration/source 精确 allowlist；seed、env、package/lockfile 与其他 schema 文件继续受 allowedFiles/blockedFiles 双重约束。

## Design Final Disposition

Decision: APPROVE_DESIGN_TRANSITION_ONLY

允许进入治理 transition 提交与 ff-only closeout。书面规格尚待用户复核；复核前不得编制 implementation plan 或修改产品、测试、schema、migration 源码。该结论不等同数据库或 runtime 验收。

## Product Implementation Invariant Audit

Result: pass_pending_cumulative_reviews

- `unused + redeem_deadline_at = null` 不参与时间过期；admin status mapper、expired/unused filters、student preview 与 confirm JIT 均显式分支 null。
- 显式 `status = expired` 在 null deadline 下仍阻断；finite past deadline 仍按服务器检查时刻过期。
- preview canonical facts 始终包含 `redeemDeadlineAt`；JSON null 与 finite ISO string 产生不同 preview version。
- expired filter 只包含显式 expired，或 `unused + non-null + past`；unused filter 包含 null 与 non-null future。
- deadline ASC/DESC 都先按 `isNull(deadline) ASC`，再按 deadline 各自方向排序，因此两向均 null last；真实 Drizzle expressions 已由 PostgreSQL dialect 编译断言锁定。
- admin omitted 与显式 null 均映射长期；empty、malformed、非字符串与非未来有限日期保持不同 fail-closed 路径。
- `durationDay` 仍必填且范围为 1..1095；edition、并发消费、幂等、一次性/授权 UI 明文边界与证据脱敏均未放宽。
- migration source 只对 `redeem_code.redeem_deadline_at` 执行 `DROP NOT NULL`；snapshot/journal 无额外 schema drift，且未执行数据库动作。

## Full Regression Scope-Correction Audit

Result: pass

历史 F-0116 smoke 的永久 terminal 假设与合法后继 migration 冲突。精确 scope correction 只允许修改该 smoke，并只删除
`journal.entries.at(-1)` 必须等于 F-0116 tag 的断言；entry 唯一性、idx 连续、snapshot 链和完整结构仍受保护。独立 reviewer 结论为 Approved，无 Critical/Important/Minor finding。未恢复旧合同、未回退 F-0117 migration、未扩大产品能力或普通 SHA-drift 授权。

## Task 1-5 Review Disposition

Result: pass

- Task 1：Approved，无 Critical/Important/Minor。
- Task 2：Approved，无 Critical/Important/Minor。
- Task 3：初审 Important 要求锁定实际 filter/sort SQL；补强后复审 Approved，无未关闭 finding。
- Task 4：Approved，无 Critical/Important/Minor。
- Task 5：Approved；记录一个非阻断测试缩进 churn Minor，不影响语义、scope 或门禁。

## Task 6 Cumulative Reviews

- Round 1：APPROVED；Critical 0、Important 0、Minor 1。独立 reviewer 核对 synthetic package 与实时 staged diff patch-id 一致，并确认 nullable 三态、omitted/null/empty、DTO key、filter/status/null-last、preview version、confirm JIT、migration exactness、no-DB 与明文脱敏均满足规格。
- Round 1 Minor：F-0117 migration smoke 仍断言当前 migration 为 journal 末项。它不削弱本次 source、metadata 或线性链验证，故不阻断产品 closeout；为避免扩大当前一次性 smoke scope-correction，记录为 F-0117 closeout 后机制评估输入。
- Round 2：APPROVED；Critical 0、Important 0、Minor 1。独立 reviewer 核对 latest synthetic 单父拓扑、index tree 与 stable patch-id，并对 null-unused、explicit expired、finite past、omitted/null/empty、DTO key、filter、两向 null-last、preview version、confirm JIT、`durationDay`/edition/plaintext/concurrency、migration/no-DB 与 F-0116 smoke 链逐项尝试反证，未发现阻断 finding。
- Round 2 Minor：沿用 Round 1 的 F-0117 terminal-smoke 未来摩擦；本次扩修会扩大一次性 scope-correction，明确递延至 closeout 后机制评估。
- 主线程 review：PASS；产品 diff、验证证据与两轮 disposition 一致。
- Final disposition：`APPROVED_FOR_PRODUCT_COMMIT`。允许创建唯一产品提交；状态 transition、合入、推送与清理仍须按 closeout 状态机依序执行。

## Governance Gate Audit

Result: pass

- P1 manual 与 P0 global 均通过；WIP=1、finding/impact counts、runtime pending 和 dependency-cycle 投影保持一致。
- Module pre-commit 对 27 个候选文件逐项命中 queue allowlist，敏感证据与术语扫描通过。
- 首次 Module hard-block 精确识别 implementation plan 中不应进入提交文档的数据库连接变量名/占位值；仅脱敏该计划文本后通过，没有削弱扫描器或扩大授权。
- state/queue 未进入产品候选，普通 `in_progress` SHA drift、closeout state machine、P0/P1/Module 与审批边界均未改变。

## Final Disposition

Decision: APPROVE

两轮累计审查和主线程逐项复核均通过，允许创建 F-0117 唯一产品提交。非阻断 terminal-smoke Minor 递延至产品 closeout 后的窄口径机制评估；不得借此扩大当前 scope-correction 或削弱任何守卫。

## Closeout Evidence Projection Review

Result: pass

主线程 fresh review 确认：本次 amend 只补齐 Module closeout 所需的标准 evidence anchors 与计划完成标记；产品源码、测试、schema、migration、授权和两轮 review 结论均无变化。state/queue 已恢复 `in_progress`，ready transition 仍须作为后续仅两文件提交执行。
