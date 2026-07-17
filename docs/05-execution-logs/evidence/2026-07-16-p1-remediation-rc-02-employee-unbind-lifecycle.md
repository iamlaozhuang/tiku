# P1 RC-02 员工解绑成员生命周期证据

日期：2026-07-16

任务：`p1-remediation-rc-02-employee-unbind-lifecycle-2026-07-16`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

已读取标准/高级版需求索引、US-01-12、D05/D15/D29、CT-REQ-043/054、ADR-002/007、F-0114 ledger 与 post-P0 map，并逐层检查解绑、再绑定、session、quota、组织门户、运营详情和企业训练写入。

## Requirement Mapping Result

- US-01-12 要求解绑后不再继承企业授权、不默认停用账号、保留个人授权和历史快照；调动/解绑必须撤销 session 并阻止旧组织未提交训练继续。
- CT-REQ-043 要求解释并落实授权、训练、session 与历史影响；CT-REQ-054 保持 employee mutation 仅由 `ops_admin` / `super_admin` 执行。
- D15 要求 transfer 或 invalid organization authorization 阻止未提交训练继续，已提交摘要只读保留。
- ADR-002 要求权限与业务规则在服务端/repository 强制，UI 或历史行存在性不能充当当前成员边界。

## JIT Revalidation Result

Result: pass

F-0114 Verdict: `confirmed_residual`

- post-P0 已补齐解绑事务的 quota release、session revoke、旧组织 `in_progress` → `read_only`，并让正式再绑定复用 retained employee row；原 finding 不能按旧证据整包重开。
- `organization-portal-overview-repository.ts` 的 summary 仍只按 `employee.organization_id` 统计，preview 才筛 `user.user_type = employee`，可稳定形成总数/名单分叉。
- `local-session-runtime.ts` 与 `admin-flow-runtime-repository.ts` 的当前身份投影仍直接返回历史 employee/organization join 字段，personal 用户可携带 stale current binding。
- 企业训练 lineage 查询与 answer 写事务分离；save/submit transaction 未取得解绑使用的 employee identity lock，也未重验 current membership，旧请求可与解绑交错并在解绑后写回 `in_progress`。
- 当前 6 个相关测试文件 81/81 通过，证明现有回归集未覆盖上述 residual，而不是证明 finding 已关闭。

## Patch Contract

- Root cause: 保留的 employee 历史身份被部分消费者当作当前 membership，且训练写事务未与解绑生命周期串行。
- Security property: 只有 active employee membership 可投影当前组织或写入未提交训练；unbind/rebind 与训练写入按 employee identity 串行。
- Exact touchpoints: local session、ops user repository、organization portal summary、organization training transaction 及六个聚焦测试文件。
- Explicit exclusions: schema/migration/history table、真实 DB/runtime/browser、其他 P1/P2、依赖、Provider、PR/deploy。
- Required RED: current-member summary filter、personal binding null、same-lock membership recheck before answer write。

## Scope Freeze

Result: pass

范围只覆盖 F-0114 residual。保留 P0 已实现的解绑/再绑定/quota/session/read-only 语义，不修改 schema，不删除历史 employee/answer，不扩大组织管理员权限。

## Transition Evidence

Result: pass

- 前序 F-0108 实现提交 `2e6950a696f5233b02eee4ce2ea2b03448f805ab` 与 ready-for-closeout 提交 `6b8946b37d950e12f1df2cc7284f74fc41016282` 已完成 ff-only 合入、fresh-master build、405 文件/2439 用例完整回归、origin/master 同步与隔离资源清理。
- transition 提交 `8ba687b0b16ccf74b0c894db90f936749d13094c` 只包含 state、queue、新 plan、新 evidence、新 audit 五份治理文件，已通过 P1 `transition_only` 和 Module ancestor checkpoint。
- 该提交已 ff-only 合入并普通推送至 `origin/master`；产品实现开始时 local master、origin/master 与实时远端均为 `8ba687b0b16ccf74b0c894db90f936749d13094c`。
- 本 transition 只允许 state、queue、新 plan、新 evidence、新 audit 五份治理文件；产品源码和测试保持零 diff。
- 只有该治理提交通过 P1 `transition_only` 与 Module ancestor checkpoint 后才能开始产品修改；任何其他 `in_progress` SHA 漂移继续 hard-block。
- P2、RV-0018 至 RV-0021、schema/migration、数据库、依赖、Provider、browser/e2e、PR、force push 与部署边界保持不变。

## Validation Results

Result: pass

- 初始 RED：3 个聚焦文件 44 项中 5 项失败，分别锁定 personal retained session 投影、门户 summary current-membership 谓词、ops 当前绑定、训练同锁重验和 retained identity 再绑定锁。
- ABA 补充 RED：2 个文件 40 项中 3 项失败，证明仅重验 `user_type` 不能阻断旧 lineage 跨越 unbind + same-org rebind；测试要求原 `employee_org_auth.id` 贯穿至事务内重验。
- GREEN：聚焦 6 文件 90/90 通过；训练 draft/submit 的 membership-false 动态测试验证顺序为 lineage lookup → employee identity lock → exact reservation recheck，且 answer lock/insert/update 均未发生。
- 完整 unit：405 文件、2448 项全部通过。
- `npm.cmd run lint`、`npm.cmd run typecheck`、`npm.cmd run format:check`、`npm.cmd run build`、`git diff --check` 全部通过。
- P1 manual guard 为 `standard` pass；P0 global baseline pass；Module pre-commit hardening 扫描 10 个变更文件并 pass。
- 未执行真实 PostgreSQL、browser/e2e 或 Provider；RV-0018 至 RV-0021 保持 pending，本结论仅关闭 F-0114 static residual。
- 实现提交 SHA 由包含本证据的任务提交最终确定；ready-for-closeout 仍保持独立 state/queue 提交。

## Round 1

Result: pass

范围主审从 retained employee identity 逆向核对 current membership 消费者，确认不能用物理删除行掩盖问题；实现进一步发现 ABA：旧请求取得 lineage 后，unbind 删除 reservation、same-org rebind 新建 reservation，若只重验 user/employee/org，旧请求会误认新成员关系。

最小修复将原 `employee_org_auth.id` 作为 membership generation 随 draft/submit input 传入；写事务在共享 employee identity lock 下先精确重验该 reservation、employee、organization、version 和 active employee 状态，再取得 answer lock。解绑/再绑定删除并重建 reservation，因此旧 lineage fail closed。

## Round 2

Result: pass

两名独立只读审查者均给出 PASS：

- membership 审查确认 login 与 existing-session hydration、ops list/detail、portal summary/preview 均使用 current employee 边界；personal auth 与 submitted history 保留，再绑定复用 retained employee row，quota 失败通过事务抛错回滚。
- training race 审查确认 exact reservation id 已关闭 lineage → unbind → same-org rebind → stale save/submit ABA；锁序为 organization scope → employee identity → quota 与 employee identity → membership → answer，未发现锁环，membership-false 零 answer 写入。

schema/history table、真实 DB/runtime 与其他 finding 均保持排除。

## Closeout Command Evidence

- `corepack pnpm@10.15.1 exec vitest run tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts src/server/services/employee-account-service.test.ts src/server/auth/local-session-runtime.test.ts src/server/services/organization-portal-overview-route.test.ts src/server/repositories/organization-training-repository.test.ts src/server/repositories/admin-flow-runtime-repository.test.ts --maxWorkers=1`
- `npm.cmd run test:unit -- --maxWorkers=1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run format:check`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-employee-unbind-lifecycle-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-02-employee-unbind-lifecycle-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-02-employee-unbind-lifecycle-2026-07-16 -SkipRemoteAheadCheck`
- `git diff --check`

Cost Calibration Gate remains blocked。

threadRolloverGate: `continue_current_thread`。保持 WIP=1，不并行物化下一产品任务。

nextModuleRunCandidate: `P1-RC-02 employee credential and membership transaction JIT revalidation (F-0115)`；仅指向冻结 ledger 中同簇下一 pending 候选，不预先物化任务或声明结论。
