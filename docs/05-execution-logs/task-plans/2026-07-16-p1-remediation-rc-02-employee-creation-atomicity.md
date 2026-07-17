# P1 RC-02 员工创建原子性整改方案

日期：2026-07-16

任务：`p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`

分支：`codex/p1-rc02-employee-creation-atomicity`

工作树：`D:/tiku/.worktrees/p1-rc02-employee-creation-atomicity`

## 目标

即时深复检 F-0115 在 P0 与后续 F-0108/F-0114 基线上的真实残留：员工 `auth_user`、`auth_account`、`user`、`employee` 与 quota reservation 必须形成单一可回滚提交；批量异常、未知响应和重试不得留下孤儿凭据、重复账号或无法安全分发的一次性初始密码。

## 必读规范与权威来源

- `AGENTS.md`、术语表、品味十诫与全部 ADR，重点 ADR-002、ADR-007。
- 标准/高级版需求索引、edition-aware authorization、管理员运营、员工授权与额度、批量导入及一次性密码需求。
- `modules/06-admin-ops.md`、相关 story、cross-cutting transaction/idempotency requirements、D05/D29 与 CT-REQ-043/054。
- F-0115 ledger、post-P0 map、P1-RC-02 根因簇、P0/F-0108/F-0114 最新 evidence 与 RV-0018 入口。
- 当前 employee account service、组织授权 runtime/repository、批量导入 UI/route 与对应测试。

## 第一性原理与 JIT 顺序

“接口返回成功”不是账号创建原子性的权威事实；权威事实是所有身份、成员和 quota 副作用是否在同一事务中共同提交。一次性密码只有在对应事务确定提交后才能进入同步分发结果。

本任务不得按旧代码证据整包重开。transition 推送后先核对 P0 是否已把凭据创建并入 employee repository transaction，再分别攻击：事务中途失败、手机号并发冲突、批量第 N 行抛异常、成功结果聚合、响应丢失与重试。若核心原子性已关闭，只修有新鲜静态证据的 residual；若剩余安全属性必须依赖持久 batch command、secret recovery 表或 migration，立即停止并申请独立授权。

## TDD 与实现边界

1. 先建立 post-P0 baseline 与 RED，证明可复现 residual；无 RED 不修改产品代码。
2. 最小修复只能触及冻结 allowlist 内的 employee creation、batch orchestration、一次性结果与 smoke tests。
3. 保留 `ops_admin` / `super_admin` 写权限、组织范围、手机号身份冲突、quota 与审计脱敏语义。
4. 禁止 schema/migration、真实 DB、外部分发服务、依赖、Provider、browser/e2e、P2、PR、force push 与部署。

## 两轮对抗审查

- Round 1：逐个副作用注入失败，验证回滚；攻击并发手机号、重复请求、批量中途异常、非 JSON/断链和一次性密码与提交结果不一致。
- Round 2：独立只读复核 transaction ownership、异常分类、secret 生命周期、范围与回归；不得写文件或执行真实 DB/runtime/browser。

## 完成条件

- F-0115 static residual 被新鲜证据关闭，或明确证明 post-P0 已覆盖并以零产品 diff 关闭；RV-0018 保持 pending。
- 聚焦、完整 unit、lint、typecheck、format、build、P0/P1/Module 门禁通过。
- 独立实现提交、ready-for-closeout 提交、ff-only 合入、普通 push 与隔离资源清理完成后，才进入下一 JIT finding。
