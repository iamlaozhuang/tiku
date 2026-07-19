# Redeem Code Nullable Deadline Design

日期：2026-07-18

状态：F-0117 产品实现已完成；closeout migration smoke appendability 书面规格已批准；Task 7 已验证

任务：`p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`

## 目标与授权边界

关闭 F-0117：让 `redeem_code` 的兑换截止日成为真正可选字段。`redeemDeadlineAt = null` 表示未使用卡密可长期兑换；授权有效期 `durationDay` 仍为必填，兑换后授权到期日仍按兑换时间计算。

用户 fresh approval 仅允许 schema/migration source。实现可修改 Drizzle schema，并生成可审查 migration SQL、snapshot 与 journal；禁止连接或执行任何数据库、禁止 backfill/seed、禁止 `migrate`/`push`。

## 当前事实与根因

- 稳定需求明确：兑换截止日可选；不设置时，未使用卡密长期可兑换。
- 当前 `redeem_code.redeem_deadline_at` 在 schema、初始 migration 与最新 snapshot 中均为 `NOT NULL`。
- 管理端输入省略截止日时，service 自动合成有限日期；contracts、repositories、preview model 和 UI 都把截止日当作必有字符串或 `Date`。
- 当前 8-file / 66-test 聚焦矩阵全部通过，但没有覆盖 `null` deadline；因此现有 GREEN 不能反证 F-0117。

根因不是单个 UI 校验，而是持久层、传输合同、状态计算和展示共同编码了“截止日必有”的错误不变量。只修 UI 或使用远未来哨兵都会让数据库和服务语义继续错误。

## 方案 A：全链 nullable

### 1. Schema 与 migration source

- `src/db/schema/auth.ts` 仅将 `redeem_code.redeem_deadline_at` 改为 nullable，不改变其他 timestamp 字段。
- 使用既有 `drizzle-kit generate` 生成 `*_p1_rc_02_redeem_code_nullable_deadline.sql`、对应 snapshot 和 `_journal.json` 更新。
- 预期 SQL 语义只有 `ALTER TABLE "redeem_code" ALTER COLUMN "redeem_deadline_at" DROP NOT NULL;`；不得夹带其他 schema 漂移。
- 既有有限日期值原样保留；无需也禁止 backfill。生成命令只允许使用非真实、不可连接的本地占位 `DATABASE_URL` 满足配置解析，禁止任何数据库执行命令。

### 2. API 输入与输出

- 生成请求中的 `redeemDeadlineAt` 允许 omitted 或显式 `null`，两者统一规范化为 `null`，含义为长期可兑换。
- 空字符串不得代替 `null`；非空但不可解析、或不晚于当前时间的日期继续返回输入校验错误。
- 所有 generation/list/detail/preview 输出始终保留 `redeemDeadlineAt` key，类型为 `string | null`；不得在 `null` 时省略字段。
- `durationDay` 继续必填且保持现有范围校验；不得把兑换截止日与兑换后授权有效期混为一体。

### 3. Repository 与状态语义

- 写入 input 与 row 类型允许 `Date | null`，映射输出使用显式 null 分支，禁止无条件 `.toISOString()`。
- 有效状态计算：显式 `status = expired` 仍为过期；仅当 `status = unused`、deadline 非 null 且早于检查时间时，才由时间推导为过期。
- `expired` 筛选只包含显式 expired，或 deadline 非 null 且已过期的 unused 行。
- `unused` 筛选包含 deadline 为 null 的 unused 行，以及 deadline 尚未到达的 unused 行。
- deadline 排序必须显式 `NULLS LAST`，升序和降序都不能依赖 PostgreSQL 默认 null 顺序；优先以 Drizzle 表达式组合实现，不在业务层拼接 SQL 字符串。
- admin generation、list、detail 与审计 metadata 对 null 使用稳定 `long_term`/null 语义，不记录明文卡密或 hash。

### 4. Preview 与兑换确认

- preview 对 `null` deadline 不执行时间比较，返回 `redeemDeadlineAt: null`。
- preview version 的 canonical facts 必须显式包含 null；有限日期与长期可兑换必须生成不同 version，且不能因 JSON key 被省略产生碰撞。
- confirm repository 的 JIT 过期判断同样只在 deadline 非 null 时执行。preview 后 deadline 从 null 改为有限值或反向变化时，现有 version/JIT 机制必须 fail-closed，不能绕过确认时事实。
- 已使用、显式 expired、目标不合法、并发兑换与幂等语义保持不变。

### 5. UI 行为

- 管理端生成表单增加明确的“长期可兑换（不设截止）”控制；为减少默认行为变化，现有有限日期默认值可保留，但用户可显式切换长期模式。
- 长期模式禁用日期输入并提交 `null`；退出长期模式时恢复可编辑的合法未来日期，不提交空字符串。
- generation 结果、列表、详情和分发区域统一显示“长期可兑换”；有限日期继续按现有日期格式显示。
- 学员 preview 对 null 显示“长期可兑换”，不得调用只接受 string 的日期 formatter。
- loading/empty/error、权限、no-store 与明文卡密分发边界不变；不新增硬编码颜色或主题判断。

## RED→GREEN 对抗矩阵

1. Schema test 先证明 `redeem_deadline_at` nullable；migration-source test 证明只 drop 该列 NOT NULL，并同步最新 snapshot/journal。
2. Admin service：omitted/null -> null；空字符串/非法/过去日期失败；有限日期保持原行为。
3. Fake/repository contract：create/list/detail 都可传递 null，不发生 `.toISOString()` 异常。
4. 筛选：expired 排除 null；unused 包含 null；显式 expired 仍命中；升降序均 nulls last。
5. Preview：null 可用、DTO key 为 null、canonical version 区分 null/finite。
6. Confirm：null 不过期；显式 expired 仍拒绝；preview 后 deadline 变化 fail-closed；并发语义不退化。
7. Admin UI：可选择长期模式、提交 null、三处展示一致；有限日期流不回归。
8. Student UI：preview null 展示“长期可兑换”；不崩溃、不泄露内部 id 或明文卡密。
9. 聚焦矩阵之后运行 full unit、lint、typecheck、format、build、P1/P0/Module guards 与两轮对抗复核。

## 非目标与停止条件

- 不执行或连接数据库，不做 backfill、seed、数据迁移验收、staging/prod 操作。
- 不新增依赖，不修改 package/lockfile、env、Provider、部署或基础设施。
- 不修改授权 edition、`durationDay`、卡密种类、明文分发、审计脱敏或并发兑换模型。
- 不实现 P2、runtime/browser 验收、PR、force-push 或 deploy。
- 若 drizzle generate 产生目标列之外的 schema diff，立即停止，不手工掩盖漂移。
- 若最小实现需要 allowlist 外产品文件或其他 finding 修复，立即停止并申请精确 scope correction。

## 规格复核门禁

本文件提交并 ff-only 合入 `master` 后，必须由用户书面复核。复核前不得调用 writing-plans，不得修改产品、测试、schema 或 migration 源码。用户批准后才编制 implementation plan 并从 RED 开始。

## Closeout Addendum：Migration Smoke 可追加链语义

### 问题与目标

F-0117 产品实现、静态验证、两轮复核、治理 closeout 修正、合入与推送已经完成，任务当前为 `ready_for_closeout`。剩余机制摩擦位于 `tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`：测试使用 `journal.entries.at(-1)`，把 F-0117 迁移错误绑定为 journal 永久末项。任何合法后续迁移都会使该历史测试失败，即使 F-0117 自身的 journal 邻接关系、snapshot `prevId` 和 schema diff 完全正确。

本 addendum 只让 F-0117 migration smoke 验证自身在可追加线性迁移链中的不变量，不降低全局迁移完整性，不修改产品、schema、migration、journal、snapshot 或任何守卫语义。

### 任务形态与隔离

- 作为 F-0117 closeout 前的独立、可审查小提交执行，保持当前 F-0117 为唯一 WIP，不物化第二个产品任务。
- 规格、实现均使用独立短分支和 worktree；实现由独立 Subagent 执行，主线程逐项复核，再由独立 reviewer 完成第二轮对抗复核。
- 实现提交只允许修改以下既有 F-0117 allowlist 文件：
  - `docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md`
  - `docs/05-execution-logs/task-plans/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline-design.md`
  - `docs/05-execution-logs/evidence/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline.md`
  - `docs/05-execution-logs/audits-reviews/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline.md`
  - `tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`
- authoritative task worktree 中的 `project-state.yaml`、`task-queue.yaml`、P1/P0/Module guards、guard smoke、产品源码、schema、migration、snapshot、journal、package/lockfile、env、Provider、runtime/browser、P2、PR、deploy 全部禁止修改。唯一例外是 RED/GREEN 使用的 disposable worktree 可临时追加 synthetic journal fixture；该临时改动不得进入任务 diff 或任何提交。

### 可追加链校验

测试继续通过 migration suffix 找到恰好一个 F-0117 SQL 文件，并保留“SQL 仅包含目标列 `DROP NOT NULL`”的精确断言。snapshot 测试改为：

1. 在 journal 中按完整 migration tag 精确匹配，要求匹配项恰好一项。
2. 取得该匹配项的实际索引，要求其前一项存在。
3. 要求当前 journal entry 的 `idx` 等于直接前项 `idx + 1`。
4. 从直接前项 tag 的 14 位时间戳动态定位 previous snapshot；不再硬编码前一 snapshot 文件名。
5. 要求当前 snapshot 存在、其 `prevId` 等于 previous snapshot 的 `id`，且当前 `id` 不等于 previous `id`。
6. 继续规范化 snapshot 身份字段和目标列 `notNull` 后做全对象比较，证明除 `redeem_code.redeem_deadline_at.notNull: true -> false` 外没有其他 schema 漂移。
7. 不断言 F-0117 是 journal 末项，也不忽略、重排或重写任何后续迁移。

### RED→GREEN 与失败处理

- RED 在 disposable worktree 中运行：仅向其 `_journal.json` 追加一个 synthetic later entry；当前 `.at(-1)` 断言必须失败，证明根因可复现。该 disposable 改动不得进入任务 diff。
- GREEN 使用候选测试文件在同一 later-entry fixture 中重跑；F-0117 测试必须通过，证明测试只校验自身局部链关系。
- 正常仓库目标测试必须继续通过；若唯一匹配、直接前项、相邻 `idx`、snapshot 文件或 `prevId` 任一不成立，测试必须 fail closed 并给出对应 Vitest assertion。
- 若修正需要共享 helper、新 guard 能力、state/queue 自修改、schema/migration 变更或其他 finding 修复，立即停止；不得扩大本 addendum。

### 验证与 closeout

实现后依次运行：目标测试与 disposable RED/GREEN、完整 unit、lint、typecheck、format、build、P1 manual/pre-commit/pre-push、P0 global、Module pre-commit/pre-push、`git diff --check`、敏感信息和精确文件集检查。focused 结果不得替代最终 closeout full evidence。

两轮复核必须确认：没有削弱历史 migration source 断言；没有接受重复 tag、缺失 predecessor、非相邻 idx、错误 `prevId` 或额外 snapshot diff；没有修改数据库执行、Provider/runtime、P2、PR、force-push 或 deploy 边界。全部通过后，按 standing authorization 创建独立提交、ff-only 合入 `master`、普通 push `origin/master` 并清理分支/worktree，然后关闭 F-0117 并恢复下一 P1 finding。

本 addendum 获用户书面规格复核前，不得调用 writing-plans，也不得修改测试实现。
