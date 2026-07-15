# P0 RC-03 Security And Adversarial Review

Date: 2026-07-15

Task: `p0-remediation-rc-03-authorization-object-scope-2026-07-14`

Branch: `codex/p0-rc-03-authorization-object-scope`

Base: `4be7cfb8e264dd0a42def6a2e744e2cc108238d9`

Reviewer: current Agent self-adversarial review; no Subagent approved or used

Verdict: `APPROVE_BRANCH_CLOSEOUT / fresh_master_gate_required_after_merge`

## Finding Independence

- F-0011：企业训练生产写链对象级授权；保持 confirmed，不因共因修复删除原 finding。
- F-0014：个人、员工和组织管理员 AI 生成 scope 越权；保持 confirmed。
- F-0016：企业训练员工读取/作答 lineage 越权；保持 root_cause_alias，独立验收义务不等于 duplicate。
- RV-0020 和其余 runtime backlog 仍 pending；静态证据不足未被解释为问题不存在。

## Risks Reviewed

- silent authorization switching、cross-organization/object access、stale/expired/cancelled auth、standard-to-advanced elevation、duplicate context ambiguity。
- idempotency collision、TOCTOU、partial write、version lineage drift、employee reservation drift、historical compatibility。
- API/internal lineage leakage、raw provider/prompt/credential leakage、状态机与跨角色回归。

## Round 1 — Root Cause / Diff / Transaction / Security

Conclusion: `pass`.

- 唯一 authorization object scope 由 `authorizationPublicId + source + owner + organization + profession + level + edition + capability` 构成；任一不一致或 public ID 重复即 fail closed。
- personal/employee AI 只验证请求显式选中的 effective context；organization admin AI 只验证 session service-computed `org_auth`，均禁止为获得 advanced 能力静默换源。
- enterprise training 写链先验证 session-selected ID 和精确 scope，再由 repository 查询 current active advanced lineage；employee query/write lineage 精确联结 version auth、profession、level 与 reservation。
- authorization 取消、过期、organization 失活、upgrade 失效或 lineage mismatch 时权威查询返回 null；测试验证不调用持久化写。
- idempotency/task identity 纳入 selected authorization 和 profession/level；相同客户端 key/request ID 跨 scope 不复用。
- 复核期间发现并修正公共 mapper 泄露 authorization lineage、请求时间双读窗口、跨 scope idempotency 碰撞和 employee write 测试缺口。

## Round 2 — Cross-role / State / API / Regression

Conclusion: `pass`.

- personal advanced、org advanced admin、advanced employee 的 AI/training 正常路径保持；standard、错 role、跨 organization、错 scope、非法 capability 均拒绝。
- training list/detail/save/submit/readonly 复用同一 visibility predicate；publish/taken-down/deadline/duplicate submit 等状态机由全量测试覆盖。
- internal authorization lineage 在 repository/service 内用于判定，公共响应显式剥离；API 仍为 public ID、camelCase、标准 envelope、`null`/`[]`，无 numeric ID、候选集合或敏感 Provider 数据。
- AI 生成旧关闭基线、plan-and-select、RAG/题源和正式内容隔离未被无证据重开；runtime/Provider 未执行。
- P1/P2 只更新影响映射，未全量复验、降级、关闭或顺手修复。
- focused `7/7` files、`211/211` tests；full unit `382/382` files、`2219/2219` tests；lint/typecheck/format/diff/build 全部通过。

## Current Boundary Verdict

- 无剩余 blocking static finding，可按 standing authorization 执行当前任务可审查提交、ff-only 合入 master、fresh-master 门禁、普通 push 和隔离资源清理。
- 任一 guard、fresh-master test/build、remote sync 或 cleanup 失败，均不得领取 RC-04。
- database apply/read/write、runtime acceptance、browser/e2e、Provider、依赖、PR、force push 和部署仍未授权。
