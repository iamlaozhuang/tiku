# P0 RC-03 Evidence

Date: 2026-07-15

Task: `p0-remediation-rc-03-authorization-object-scope-2026-07-14`

Status: `ready_for_closeout`

result: pass

## Baseline And Recovery

- claim base/master/origin/live remote: `4be7cfb8e264dd0a42def6a2e744e2cc108238d9`
- branch: `codex/p0-rc-03-authorization-object-scope`
- worktree: `D:/tiku/.worktrees/p0-rc-03`
- RC-02 remote sync、worktree cleanup、short branch cleanup 已核实通过。
- `D:/tiku-readonly-audit` 保持只读，HEAD `a84224fa12ec85b28e6acd945deba2afa28c6c02`，最终复核工作区无改动。
- 隔离 worktree baseline：`381/381` test files、`2207/2207` tests passed。
- 主工作区仍在 `master@4be7cfb8e264dd0a42def6a2e744e2cc108238d9` 且干净；Agent 临时 `.corepack` 缓存已按精确路径清理，未加入提交。

## Reading Evidence

status: complete

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

conflictsFound: false

完整读取清单、SSOT 顺序、RC-01/02 影响和 P1/P2 影响映射见 task plan。高级版需求索引、edition-aware authorization、ADR-007、AI 生成最新关闭基线和目标代码均已读取；没有无法按来源层级与时间序消解的冲突。当前 Agent 完成两轮不同重点的自对抗复核，未使用 Subagent。

## Requirement Mapping Result

| finding | status           | static remediation conclusion                                                                                                                                                                                                |
| ------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-0011  | confirmed        | 企业训练 manual draft、publish、copy、source attach 在写前解析 session 选中的当前 `org_auth`，精确校验 organization、profession、level、advanced、capability 和有效期；持久化 lineage 查询再次要求 active/current advanced。 |
| F-0014  | confirmed        | personal、employee、organization admin AI 生成使用唯一 selected authorization 与请求 profession/level 求交；跨 authorization/scope 幂等身份分离，不静默换源。                                                                |
| F-0016  | root_cause_alias | employee training list/detail/save/submit/readonly 共用 version lineage 与全部当前 advanced context 的精确求交；独立验收义务保留。                                                                                           |

以上是静态整改结论，不代表 RV-0020 或任何业务运行时验收通过；原 finding、风险级别和只读审计状态均未改写。

## Implementation Proof

- 新增共享 authorization object-scope selector：同一 public ID 必须唯一，且 source、owner、organization、quota owner、profession、level、advanced edition、capability 和 blocked reason 全部一致；重复候选 fail closed。
- personal/employee AI 由服务端 effective authorization context 选择显式 authorization；客户端 owner、edition、capability 不能覆盖服务端事实。
- organization admin AI 以 session 的 service-computed authorization public ID 重新查询当前 `org_auth`；同一次请求只使用一个时间快照，过期、standard、错 organization 或错 scope 不创建 task。
- personal 与 admin AI 的 task/idempotency identity 纳入 selected authorization、profession 和 level；相同客户端 key/request public ID 不能跨 scope 复用旧任务。
- 企业训练生产 runtime route 只接受 session-selected authorization；repository 查询要求 organization/user/org_auth active、授权当前有效、advanced 或当前有效 upgrade，并把 version `org_auth_id`、authorization public ID、profession、level 与 employee reservation 精确联结。
- 训练内部 lineage 仅用于 service/repository 判定；`copyPublishedVersion` 明确移除 `authorizationPublicId`，employee/admin API 不暴露内部 authorization lineage、numeric ID 或候选授权集合。
- 所有不匹配路径在 repository/provider/正式写前返回；测试证明 manual draft 和 employee draft/submit 不发生持久化副作用。

## RED / GREEN

- employee AI 跨 profession/level：RED 请求被错误接受；接入唯一对象 scope selector 后 GREEN。
- personal idempotency：相同 client key 跨两个 authorization/scope 时 RED hash 相同；服务端 scope hash 后 GREEN。
- organization admin AI：同一 request public ID 跨两个 `org_auth` 时 RED task/idempotency identity 相同；scope identity 后 GREEN。
- enterprise training：borrowed `org_auth` manual draft RED 可进入 lineage；session-selected ID 与 repository current-context 双重校验后 GREEN。
- employee training：错 authorization/profession/level version RED 可见；全部 advanced context 精确求交后 list 与 write GREEN。
- 首次 full unit 暴露 3 个安全契约回归：public mapper 暴露 authorization lineage、旧 repository route fixture 未提供 authoritative resolver；改为内部 enriched lineage + public copy 显式剥离，并补齐权威 fixture 后相关 `85/85` GREEN。
- 第二次 full unit 仅暴露 3 个测试仍期待内部 lineage 出现在 employee API；修正为不泄露的公共响应断言后 route `49/49` GREEN，最终 full unit 全绿。

## Round 1 — Root Cause / Diff / Transaction / Security

status: pass

- 逐条追踪 selected authorization 从 session/effective context 到 route、service、repository 和持久化 lineage；未保留客户端 capability、任意第一条 advanced context 或 silent fallback 旁路。
- active/status/time/upgrade、organization coverage、employee reservation、version public/internal lineage、profession/level 在权威查询中 fail closed；取消或到期后重新读取返回 null，不进入写调用。
- 幂等重放同时绑定 owner、authorization 和业务 scope；跨 scope key 碰撞不复用 task public ID 或结果。
- 复核中发现并修正：request clock 两次取值产生窗口漂移；authorization lineage 被公共 mapper 暴露；同一 request ID 跨 authorization 仍可碰撞；employee write 测试只覆盖 list 未覆盖 save/submit。
- 未新增 schema/migration、依赖或 lockfile；未访问数据库。既有历史行不被改写，缺失 lineage 的历史对象静态路径按安全要求不可答题。

## Round 2 — Cross-role / State / API / Regression

status: pass

- personal advanced、organization advanced admin、advanced employee 正常路径通过；standard、错 role、错 organization、错 authorization、错 profession/level、重复候选和 blocked capability 均拒绝。
- AI出题/AI组卷的 plan-and-select、RAG/题源、provider redaction、正式内容隔离合同未被重开或改变；Provider/runtime 未执行。
- training list/detail/save/submit/readonly 使用同一 visibility predicate；published/taken-down/deadline/duplicate submission 的既有状态机由 full regression 覆盖。
- API 保持 public ID、camelCase、标准 envelope、`null`/`[]`；不暴露 internal ID、authorization candidate set、credential、raw prompt/provider payload。
- P1/P2 仅影响映射：F-0025/F-0036/F-0143/F-0146/F-0148/F-0149 可能被局部覆盖；F-0151/F-0153/F-0154/F-0157/F-0158/F-0170 可能语义变化，全部保留到 P0 后重基线，未提前关闭或整改。

## Validation Log

- final focused affected regression: `7/7` files、`211/211` tests passed。
- final full unit: `382/382` files、`2219/2219` tests passed in `280.26s`。
- `corepack pnpm@10.15.1 run lint`: pass。
- `corepack pnpm@10.15.1 run typecheck`: pass。
- `corepack pnpm@10.15.1 run format:check`: pass。
- `corepack pnpm@10.15.1 run build`: pass；92 个静态页面生成，相关 AI/training routes 均存在。
- `git diff --check`: pass。
- P0 serial manual guard: pass；current task RC-03，next task RC-04。
- pre-commit、module closeout、pre-push 和 fresh-master 门禁属于下述 closeout 动作；任一失败即阻止 RC-04 claim。

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
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p0-remediation-rc-03-authorization-object-scope-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p0-remediation-rc-03-authorization-object-scope-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p0-remediation-rc-03-authorization-object-scope-2026-07-14 -SkipRemoteAheadCheck
```

localFullLoopGate: pass_branch_gates_fresh_master_required_after_merge

## Non-Actions

- 未新增或修改 schema/migration，未执行 database apply/read/write。
- 未执行 runtime/browser/e2e/Provider/Cost Calibration。
- 未修改依赖、lockfile、env、外部配置；未创建 PR、未 force push、未部署。

Cost Calibration Gate remains blocked.

threadRolloverGate: continue_same_goal_after_rc_03_closeout

nextModuleRunCandidate: `p0-remediation-rc-04-content-paper-aggregate-snapshot-2026-07-14`
