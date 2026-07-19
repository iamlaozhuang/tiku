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

## Task 7 Implementation Plan Review

Result: approved_for_red_green_execution

- Spec coverage：计划逐项覆盖可追加 local-chain 语义、唯一 tag、predecessor、相邻 idx、动态 previous snapshot、`prevId`、全 snapshot diff、authoritative metadata 零 diff和禁止 terminal 假设。
- TDD coverage：先在 detached later-entry fixture 复现旧断言失败，再对 authoritative 与同一 fixture 转 GREEN；duplicate tag、missing predecessor、numeric idx gap、string/float invalid idx、wrong `prevId`、extra snapshot drift 六类 mutation 必须逐一 fail closed，later-entry 本身是正常通过路径。
- Scope review：持久 diff 限于已批准 F-0117 docs/test；disposable journal/snapshot mutation 明确禁止进入提交。state/queue、guards、产品/schema/migration、依赖、数据库与外部能力均 blocked。
- Closeout review：focused 不替代 full validation；主线程 Round 1 与独立 reviewer Round 2 均为提交前硬门禁；提交、ff-only、pre-push、普通 push、cleanup 顺序明确。
- Placeholder、类型/路径一致性与命令可执行性自审通过；当前结论只批准开始 Task 7 RED，不声称实现或最终审查完成。

## Task 7 Implementation Invariant Audit

Result: historical_checkpoint_superseded_by_approved_controller_reviews

- 唯一 tag：按完整 F-0117 migration tag 搜索且要求恰好一项；duplicate mutation 已证明长度 2 时 fail closed。
- Predecessor 存在：F-0117 必须位于 journal 首项之后，直接前项必须存在且 tag 带 14 位 timestamp 前缀。
- 相邻 idx：当前 idx 必须等于直接前项 idx + 1；missing predecessor 与 non-adjacent idx mutation 均已 fail closed。
- 动态 previous snapshot：由 journal 直接前项 tag 的 14 位 timestamp 定位，不再硬编码 employee-import snapshot。
- `prevId`：当前 snapshot `prevId` 必须等于动态 previous snapshot `id`，且二者 `id` 不同；wrong mutation 已 fail closed。
- 全 snapshot diff：只规范化当前/前项身份字段与目标列 `notNull` 后做全对象比较；额外 `dialect` mutation 已 fail closed，不能被规范化掩盖。
- 后续 entry 可追加：later-entry fixture 保留 synthetic 后候选测试 2/2 passed；测试没有忽略、重排或要求读取后续 entry 内容。
- Authoritative metadata 零 diff：disposable fixture 清理后，authoritative schema、migration、journal、snapshot 与产品源码均无修改。
- 权限边界未扩大：state/queue、guards、依赖、数据库、Provider/runtime/browser、P2、PR、force-push、deploy 均未触碰。
- Review disposition：本段保留 implementer checkpoint 的时间顺序；后续主线程 Round 1 与独立 Round 2 复审均 Approved，本段 pending wording 已被 supersede。

## Task 7 Implementer Adversarial Self-Review

Decision: APPROVE_REVIEW_CHECKPOINT_WITH_BUILD_TOPOLOGY_CONCERN

- 尝试以 later-entry、duplicate tag、missing predecessor、numeric idx gap、string/float invalid idx、wrong `prevId` 与 extra snapshot drift 推翻候选；later-entry 正常通过，其余六类 mutation 均在对应局部不变量处 fail closed，恢复后全部 2/2 passed。
- 测试只规范化 snapshot `id`、`prevId` 和目标列 `notNull`；`dialect` mutation 证明额外顶层变化不会被掩盖。运行时对象保留 TypeScript 类型未声明的 snapshot 字段，因此全对象比较未被窄类型截断。
- 动态 previous snapshot 来自 journal 直接前项，不依赖 employee-import tag；F-0117 仍要求唯一 tag、非首项、相邻 idx、current/previous snapshot 存在、`prevId` 一致和完整结构相等。
- 精确 diff 为 5 个 allowlisted 文件；authoritative migration metadata 与所有 blocked surface 零 diff。disposable fixture 已删除，不在 worktree list 中。
- 唯一 concern：task worktree 本地依赖拓扑缺少 `next/package.json`，导致原位 build 命令失败；未越界修复依赖，改用仓库 root-installed dependency 定向构建同一 worktree并成功生成 96/96 static pages。该环境 concern 不影响测试语义，但控制器应在最终 review disposition 中显式确认。

## Task 7 Controller Review Disposition

Decision: IMPLEMENTATION_REVIEWS_APPROVED_PENDING_STEP_14

- 主线程 Round 1：实现语义与精确范围通过。fresh detached fixture 证明合法 later entry 通过，duplicate tag、missing predecessor、numeric idx gap、wrong `prevId`、额外 snapshot drift 均 fail closed；定向 production build 96/96 pages。
- 独立 Round 2 初审：Changes requested；Critical 0、Important 1、Minor 1。Important 指出 JSON `idx` 的 TypeScript assertion 不提供运行时保护，字符串拼接可绕过 adjacent-idx；Minor 质疑 review package 末尾完整性。
- finding disposition：Important 接受并以 current/previous 双 safe-integer 断言整改；主线程与独立 reviewer 均复现字符串 idx 现已 fail closed，独立 reviewer 额外验证浮点 idx fail closed。review package 与 `git diff -U10` 精确一致，统一 diff 的十行 context 边界解释并关闭 Minor。
- 独立 Round 2 复审：Approved；Critical 0、Important 0、Minor 0。精确 5 文件、authoritative metadata 零 diff、blocked surfaces 零变化、fixture 清理均通过。
- 主线程复核：pass。剩余 build concern 是 worktree 本地依赖拓扑不完整；root-installed dependency 对同一 authoritative worktree 的生产构建已通过，且没有为掩盖环境问题修改依赖或配置。
- Task 7 implementation 与两轮 reviews 已完成；整分支 review 的治理文档一致性 finding 按后续专节修复并等待复审。唯一未完成的计划步骤是 Step 14；在复审与 Step 14 实际完成前不声称整分支最终 Approved 或 F-0117 closeout 完成，不执行 merge、push 或 cleanup。

## Task 7 Round 2 Important Disposition

Decision: APPROVED_SUPERSEDED_BY_CONTROLLER_REREVIEW

- Finding：接受。`as Journal` 不验证 JSON runtime shape；字符串 idx 可把加法退化为拼接，使 `"321" === "32" + 1`，削弱相邻 idx fail-closed 保证。
- Root cause：相邻关系断言信任了 TypeScript assertion，而 journal 是运行时 JSON 边界。修复点必须位于算术前的 runtime numeric invariant，不能只改 type 或期望值。
- Fix：分别要求 current 与 previous idx 都是 safe integer，再执行 `current === previous + 1`。这同时拒绝字符串、浮点数、NaN、Infinity 与超出安全整数范围的值。
- TDD/mutation：旧 checkpoint 在双字符串 mutation 下错误 2/2 passed；修复后同 mutation 精确 fail at safe-integer assertion；恢复 numeric idx 后 authoritative 与 later-entry fixture 均 2/2 passed。
- Scope：tracked amendment 精确限于目标 smoke 与既有 F-0117 evidence/audit；authoritative metadata、产品、guard、state/queue、依赖、数据库与授权语义零变更。
- Disposition：Important 已由最小 fail-closed 修复关闭；独立 reviewer 对 amend 后完整 base..HEAD package 复审 Approved（Critical 0、Important 0、Minor 0），原 pending rereview 状态已被 supersede。

## Task 7 Whole-Branch Documentation Consistency Review

Decision: FINDING_FIXED_PENDING_WHOLE_BRANCH_REREVIEW

- 整分支 reviewer 的唯一 Important 成立：implementation plan 仍把 Task 7 标为 planned、Steps 1-13 未勾选、嵌入候选代码缺少 safe-integer amendment；evidence/audit 末尾仍残留已被复审 supersede 的 pending 状态和过时 mutation 数量。
- 修复只对齐治理文档：Task 7 顶部状态为 implementation/reviews complete pending Step 14，Steps 1-13 已完成而 Step 14 保持未完成，候选代码补齐 current/previous `Number.isSafeInteger`，并统一六类 fail-closed mutation 与合法 later-entry 正常路径。
- Evidence 明确保留初审 finding 的时间顺序，同时把已完成的独立 Round 2 复审记录为 superseding disposition；当前 Task 7 状态统一为 `implementation_complete_reviews_approved_pending_merge`。
- Tracked diff 限于 implementation plan、既有 evidence 与 audit；ignored task report/progress 同步。测试、产品、guards、state/queue、authoritative metadata、依赖与授权语义均未修改。
- Task 7 implementation/reviews 已完成，但本节不预先声称整分支最终 Approved；整分支 reviewer 必须复审本次 docs alignment。
- 当前唯一未完成的计划步骤是 Step 14 merge/push/cleanup；本次未执行 Step 14。

## Task 7 Whole-Branch Commit-Separation Review

Decision: FINDING_FIXED_PENDING_WHOLE_BRANCH_REREVIEW

- 第二个 Important 成立：将 post-review 治理文档对齐 amend 进 Step 13 实现提交，会使计划声明的 exact-5 implementation file set 与实际提交文件集不一致。
- 修复采用 non-destructive soft reset 恢复原实现提交 `f01469c21`，其父仍为 `12e675087`，且提交精确包含 Step 13 声明的 5 个文件；未改测试语义或提交树。
- implementation plan、evidence、audit 的状态对齐已隔离为独立 docs-only review-fix 提交。该提交不属于 Step 13 implementation file set，不含 test/spec/task-plan、authoritative metadata、guards、state/queue 或其他 blocked surface。
- 本 disposition 只表示第二个 Important 已修复并等待复审，不表示整分支最终 Approved。整分支最终复审仍 pending；Step 14 merge/push/cleanup 仍 pending 且未执行。

## Task 7 Whole-Branch Final Disposition

Decision: APPROVE_FOR_STEP_14

- 整分支 reviewer 初审的状态一致性 Important 已关闭：Task 7 为 `complete_pending_step_14`，Steps 1-13 complete、Step 14 pending；嵌入实现与 safe-integer amendment、六类 fail-closed mutation 及 Round 2 supersession 一致。
- 整分支复审的提交文件集 Important 已关闭：实现提交恢复为父 `12e675087` 的 exact-5 `f01469c21`；状态对齐独立为 exact-3 docs-only `3f8f059e3`，测试 blob未改变。
- 最终独立复审：Ready to merge；Critical 0、Important 0、Minor 0。全范围 6 个批准文件，blocked surfaces 0，review package 与实时 diff 一致。
- 主线程逐项复核：pass。本 verdict 记录仅 amend 当前 docs-only review-fix commit 的 evidence/audit；不回写或扩大实现提交，不改变任何运行时、数据库、依赖或审批边界。
- 允许进入 Step 14；仍必须先通过 final P1/P0/Module closeout/pre-push 门禁，再执行 ff-only merge、普通 push 和安全 cleanup。任一门禁失败必须 hard-block，不得修改 guard 绕过。
