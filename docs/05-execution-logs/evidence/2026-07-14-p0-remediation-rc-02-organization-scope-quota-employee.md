# P0 RC-02 Evidence

Date: 2026-07-15

Task: `p0-remediation-rc-02-organization-scope-quota-employee-2026-07-14`

Status: `ready_for_closeout`

result: pass

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

完整读取清单、需求映射与基线影响见 task plan。高级版授权、组织后台、edition/quota SSOT 与 ADR-007 已读取；未发现无法按来源层级和时间序消解的冲突。当前 Agent 完成两轮自对抗复核，未使用 Subagent。

## Baseline And Approval

- branch base/master/origin/live remote at claim: `2e529ea3d721af1511d5663bb6bcbaa5b39886fb`
- branch: `codex/p0-rc-02-organization-scope-quota-employee`
- worktree: `D:/tiku/.worktrees/p0-rc-02`
- schema commit: `ef3580f76` (`fix(auth): add organization quota reservation schema`)
- schema/migration source authoring、测试和提交已有用户明确批准；migration 未 apply，未读取或写入数据库。
- 依赖清单、lockfile、外部配置均未修改；runtime/browser/e2e/Provider/PR/force/deploy 未执行。
- `D:/tiku-readonly-audit` 只读，未修改 finding register 或原始审计状态。

## Finding Revalidation

| finding | status           | static remediation conclusion                                                        |
| ------- | ---------------- | ------------------------------------------------------------------------------------ |
| F-0005  | confirmed        | 所有生产 employee 激活路径统一到额度 reservation；访问消费者要求 reservation proof。 |
| F-0006  | confirmed        | overlap 按实际 organization/profession/level/time 相交，不再比较 `auth_scope_type`。 |
| F-0109  | confirmed        | profile、super-only move、disable、enable 分离，revision/锁序/无环/深度/回滚已建立。 |
| F-0111  | confirmed        | `current_and_descendants` 从当前树受限递归求值，循环、断链或超深 fail closed。       |
| F-0113  | root_cause_alias | 单目标导入合同成立，逐行组织兼容入口与 repository 旁路已移除；独立验收义务保留。     |

以上是静态整改结论，不代表 RV-0018～RV-0021 或业务运行时验收通过。

## Implementation Proof

- additive schema：`organization.revision` 与 `employee_org_auth`；migration 对可证明 active employee 稳定回填，超额遗留记录不取得 reservation，fail closed。
- 动态 scope helper 同时支持 `specified_nodes` 和当前无环树 `current_and_descendants`；生产授权、学习、错题、session、门户、训练 lineage、seed/owner-preview 消费者已统一。
- 固定锁序：organization scope → employee identity → 排序 org_auth quota；create/bind/import/enable/disable/transfer/unbind 与 quota、session、practice/mock termination 在事务边界内提交或回滚。
- 组织资料写、move、disable、enable 均使用 revision；move 仅 `super_admin`，拒绝 self/descendant/错层级/disabled parent/超深/overlap/quota 冲突。
- 导入只接受一个 `targetOrganizationPublicId`；CSV/TSV 禁止携带 organization/user/authorization scope 列；UI 多授权可用额度取最小剩余额度，不再求和。
- API 保持 public ID、camelCase、标准 envelope、`null`/`[]`；quota 与 audit 错误均脱敏。

## RED / GREEN

- 动态 scope/额度/owner-preview 首轮：RED `3 failed / 13 passed`；修复有界遍历、quota lock key 与动态角色投影后 GREEN `16/16`。
- dev seed：RED `1 failed / 8 passed`；移除 current-tree 静态快照并写入 reservation proof 后，联合 GREEN `20/20`。
- employee enable quota response：RED `1 failed / 3 passed`，错误被误报成功；显式 repository result、`409006` 和失败 audit 后，相关 `8/8` GREEN。
- 树完整性：RED `2 failed / 9 passed`；共享 SQL 与 migration 增加到根完整性证明后 GREEN `11/11`。
- owner preview 坏树：RED `1 failed / 7 passed`；两个角色查询与 prune 查询 fail closed 后 GREEN `8/8`。
- move 缺失 parent、profile 写锁、atomic disable、legacy repository create 旁路分别先产生 focused RED，再经 validator/事务/命令边界修复全部 GREEN。
- 多授权 UI：一条授权满额、另一条仍有额度时 RED 显示“可用 7”；改为所有继承授权的最小剩余额度后 GREEN。
- 首次 full unit 暴露两个陈旧测试假设：RC-01 journal 必须为最后一项、旧 employee create repository 合同仍存在；测试改为当前任务 tag/正式 employee account 合同，未弱化业务断言。

## Round 1

status: pass

- 权威写路径、schema compatibility、动态 scope、overlap、revision、锁序、rollback 与 quota reservation 已逐 diff 复核。
- 复核中发现并修正：坏树仍可在遇到环前命中 purchaser；profile 写未加入 organization 锁序；quota lock key 可能产生二参数语义歧义；enable quota 状态被 boolean 折叠；账号停用在提交后另做 session/flow 副作用；dev seed/owner-preview 仍信任旧快照；repository 仍暴露 legacy create 入口。
- migration 仅 additive；无 `DROP`/`TRUNCATE`/数据删除，未 apply。遗留超额不自动扩权，消费者要求 reservation proof。

## Round 2

status: pass

- super/ops/org admin/standard employee/advanced employee 跨角色边界、organization 状态机、session/训练交接、API/UI 字段、枚举和公开标识已复核。
- ops move 被服务端拒绝且 UI 不展示入口；super move 仍需 revision 和完整树校验。employee 跨 organization 访问必须同时满足 active user/org/auth、动态 coverage 与 reservation。
- phone、credential、session token、numeric internal ID 不进入 API/audit/evidence；一次性密码既有窗口未被扩大。
- P1/P2 仅影响映射：F-0114/F-0115 等因统一事务产生局部语义变化，但成员关系状态、batch idempotency、取消/到期 reservation 治理等独立缺口仍保留，未声明关闭。
- React/Next 复核未发现新增 hook、key、a11y、design token 或客户端鉴权替代服务端鉴权问题。

## Validation Log

- focused affected regression: `29` files, `162` tests passed.
- final full unit: `381` files, `2207` tests passed in `283.08s`.
- `corepack pnpm@10.15.1 run lint`: pass.
- `corepack pnpm@10.15.1 run typecheck`: pass.
- `corepack pnpm@10.15.1 run format:check`: pass.
- `git diff --check`: pass.
- first build diagnostic: Turbopack rejected the worktree `node_modules` junction because it pointed outside the filesystem root；不是源码错误。
- local-only recovery: verified the exact junction path under `.worktrees`, removed only the junction, ran `pnpm install --frozen-lockfile --offline`; `package.json` and `pnpm-lock.yaml` remained unchanged.
- final `corepack pnpm@10.15.1 run build`: pass; 92 static pages generated and `/api/v1/organizations/[publicId]/move` present.
- P0 serial guard / pre-commit / closeout / pre-push and fresh-master gates are closeout actions below; any failure blocks RC-03 claim.

## Command Accounting

```text
corepack pnpm@10.15.1 exec vitest run <focused files> --reporter=dot
corepack pnpm@10.15.1 run test:unit
corepack pnpm@10.15.1 run lint
corepack pnpm@10.15.1 run typecheck
corepack pnpm@10.15.1 run format:check
corepack pnpm@10.15.1 run build
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.ps1 -Phase manual
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p0-remediation-rc-02-organization-scope-quota-employee-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p0-remediation-rc-02-organization-scope-quota-employee-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p0-remediation-rc-02-organization-scope-quota-employee-2026-07-14 -SkipRemoteAheadCheck
```

localFullLoopGate: pass_branch_gates_fresh_master_required_after_merge

Cost Calibration Gate remains blocked.

threadRolloverGate: continue_same_goal_after_rc_02_closeout

nextModuleRunCandidate: `p0-remediation-rc-03-authorization-object-scope-2026-07-14`

Blocked remainder: database apply/read/write, runtime acceptance, browser/e2e, Provider, dependency changes, PR, force push and deployment.
