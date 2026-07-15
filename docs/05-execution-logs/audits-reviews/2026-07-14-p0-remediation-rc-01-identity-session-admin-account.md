# P0 RC-01 Security And Adversarial Review

Date: 2026-07-14

Task: `p0-remediation-rc-01-identity-session-admin-account-2026-07-14`

Branch: `codex/p0-rc-01-identity-session-admin-account`

Base: `071d4ecd23ac0ec94bf3ca506d1e61b4c5fa5ac5`

Reviewer: current Agent self-adversarial review; no Subagent approved or used

Verdict: `APPROVE_BRANCH_CLOSEOUT / fresh_master_gate_required_after_merge`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

## Requirement Mapping Result

F-0002/F-0045/F-0130 均保持原风险级别和独立结论；共享数据库状态/关系/transaction 原语不构成重复或已解决。运行时验证仍 pending。

## Files Reviewed

- auth/session schema、repository、service、default local runtime 与 tests
- admin account contract、validator、service、repository、routes、operations UI 与 tests
- user lifecycle reset/disable/enable/session revoke 类比实现
- Drizzle migration journal/snapshot 结构和迁移安全 SOP

## Risks

- `auth`、`session`、`admin`、`authorization`、`organization`、`credential`、`api_contract`、`data_contract`、`schema`、`migration`
- 暴力破解绕过、权限提升、跨组织绑定、最后 super 丢失、session 撤销不完整、审计与业务状态不一致、一次性密码泄露、并发丢更新

## Round 1

结论：`pass`；根因、权威写路径、迁移兼容和并发安全均已闭合。

- 持久锁定、数据库原子递增与 CAS 成功重置覆盖 F-0002/F-0130 的进程重启、并发失败和成功/失败交错反证。
- admin lifecycle 使用行锁、账号 advisory lock、最后 super 全局 advisory lock、事务内 role/org/status/credential/session/audit 写入，覆盖越权、并发、回滚和撤销反证。
- 复核中发现并修正：repository 层 role/org 不变量缺口、登录安全状态 `updated_at` 倒退风险、成功重置覆盖并发失败风险、旧密码验证与密码重置的 session TOCTOU、UI 网络异常无法恢复、失败审计不完整和含混 action label。
- 迁移 SQL 保留 legacy `admin.admin_role`，只做 additive/backfill/unique-index；若历史平台角色残留 organization 绑定，显式阻断 apply 并进入数据治理，不静默删改。
- 历史 snapshot 修复已获专用批准，只改后一个文件顶层 `id/prevId`；23 个 snapshot 全链唯一且线性，当前 schema generation 幂等。

## Round 2

结论：`pass`；跨角色/API/脱敏/UI/兼容性无 blocking finding。

- session runtime 从 assignment 关系生成完整 `adminRoles[]`，organization capability 对混合角色保留组织上下文。
- ops 对平台或混合角色目标 fail closed；super 可管理全部；空角色、重复角色、org 角色缺 org、平台角色残留 org 均被 validator/repository 拒绝。
- 详情、PATCH、disable/enable/reset routes 均使用 public ID；phone、credential、session token、numeric ID 不进入响应或 audit，reset 响应 `no-store` 且明文只返回一次。
- seed/backfill 保持既有单角色账号兼容；legacy 列暂保留但不再是运行时授权 SSOT。
- 当前 focused `13/13` 文件、`98/98` 测试；最终 full unit `379/379` 文件、`2190/2190` 测试；lint/typecheck/format/diff/guard/pre-commit 均通过。P1/P2 未越界，runtime 未执行。
- `npm.cmd run build` 必须在 ff-only merge 后的 fresh master（真实 node_modules）执行；该后置门禁不改变 branch diff 的 APPROVE 结论。

## Current Boundary Verdict

- RC-01 现在可按 standing authorization 执行单任务提交、ff-only 合入 master、fresh-master build/必要回归、普通 push 和隔离资源清理；任一后置门禁失败均停止，不领取 RC-02。
- No blocking findings remain in the static branch review.
- 数据库 apply、数据治理、依赖、runtime、browser/e2e、Provider、PR、force push、部署仍未授权。
- 最终 verdict 只有在迁移元数据、完整验证和两轮复核均闭合后才能改为 `APPROVE`。
