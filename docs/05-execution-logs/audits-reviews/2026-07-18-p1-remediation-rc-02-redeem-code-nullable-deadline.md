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

## Final Disposition

Decision: APPROVE_DESIGN_TRANSITION_ONLY

允许进入治理 transition 提交与 ff-only closeout。书面规格尚待用户复核；复核前不得编制 implementation plan 或修改产品、测试、schema、migration 源码。该结论不等同数据库或 runtime 验收。
