# P0 RC-02 Security And Adversarial Review

Date: 2026-07-15

Task: `p0-remediation-rc-02-organization-scope-quota-employee-2026-07-14`

Branch: `codex/p0-rc-02-organization-scope-quota-employee`

Base: `2e529ea3d721af1511d5663bb6bcbaa5b39886fb`

Reviewer: current Agent self-adversarial review; no Subagent approved or used

Verdict: `APPROVE_BRANCH_CLOSEOUT / fresh_master_gate_required_after_merge`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

## Requirement Mapping Result

F-0005/F-0006/F-0109/F-0111/F-0113 均保留原风险级别和独立 finding；`root_cause_alias` 不等于 duplicate 或自动关闭。RV-0018～RV-0021 仍 pending。

## Risks Reviewed

- organization tree corruption、cross-organization access、quota overrun、overlap ambiguity、stale scope、lost update、partial employee lifecycle、session survival、training context drift、sensitive audit/API leakage。
- schema/migration compatibility、legacy excess data、current/future/expired authorization、null/empty/boundary input、duplicate and concurrent request、transaction failure and rollback。

## Round 1 — Root Cause / Diff / Transaction / Security

Conclusion: `pass`.

- 实际 organization coverage 是唯一 scope 事实；`auth_scope_type` 只选择求值方式。所有 current-tree 查询有 visited/depth/root-integrity 证明，cycle、dangling parent、四级溢出均 fail closed。
- organization profile/move/disable/enable 均进入 revision 和 organization advisory lock 序列；move 先验证整树，变更后重验 overlap 并重建 current-tree reservation，任一失败回滚。
- employee create/bind/import/enable/disable/transfer/unbind 使用同一 quota reservation truth；固定锁序避免最后一个 slot 双占，任一覆盖授权满额即整体拒绝。
- generic user disable 与 employee disable 的 quota/session/practice/mock 副作用在同一数据库 transaction；服务层不再在提交后重复执行终止动作。
- schema/migration additive、唯一索引和稳定回填符合命名规范；超额遗留员工不获 reservation，不以扩大 quota 掩盖脏数据。
- 对抗复核中发现的 tree-integrity、lock-order、boolean error collapse、legacy seed/owner preview、legacy create repository surface 均已通过 RED→GREEN 修正。

## Round 2 — Cross-role / State / API / UI / Regression

Conclusion: `pass`.

- `super_admin` 独占 move；`ops_admin` 仅 profile/create/disable/enable；组织管理员保持只读；服务端权限为权威，客户端隐藏不作为安全边界。
- employee access 必须同时满足 user/organization/org_auth active、有效期、当前 tree coverage 和 `employee_org_auth` proof；跨 organization 或 stale scope fail closed。
- import 只接受一个目标 organization，禁止逐行 organization/user/scope 列；多授权预览按最小容量，服务端仍重新执行原子 quota 校验。
- API 使用 public ID、camelCase、标准 envelope、`null`/`[]`；revision、status 和 enum 前后端一致，quota 冲突 `409006` 且 audit 脱敏。
- 组织停启/移动、员工停用/调动/解绑的 session、practice/mock、training 状态交接已检查；历史 snapshot 不物理删除。
- P1/P2 未全量复验或提前关闭。F-0114 membership model、F-0115 batch idempotency、取消/到期 reservation 治理、picker completeness 等仍留待 P0 后重基线。
- focused `29/29` files、`162/162` tests；full unit `381/381` files、`2207/2207` tests；lint/typecheck/format/diff/build 全部通过。

## Current Boundary Verdict

- 无剩余 blocking static finding，可按 standing authorization 执行当前任务业务提交、ff-only 合入 master、fresh-master 门禁、普通 push 和隔离资源清理。
- 任一 guard、fresh-master test/build、remote sync 或 cleanup 失败，均不得领取 RC-03。
- migration apply、数据库访问、runtime、browser/e2e、Provider、依赖、PR、force push 和部署仍未授权。
