# P1 Mechanism Execution Compatibility v2.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development`; one implementation Subagent owns C1-C5 and every review fix, and one independent reviewer owns C6. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不减少检查数量、不降低 P1/P0/Module/审批/证据/Git/敏感信息门禁的前提下，把未来 `approved_same_task_transition` 从 per-finding hardcode 收敛为严格版本化合同、唯一共享决策层、三个薄适配器、分层验证与确定性新鲜证据，并在 closeout 后恢复原 P1 Goal。

**Architecture:** 使用 PowerShell 5.1 可安全解析的唯一规范化行式合同和机器证据块；原始文本先完成块唯一性、字段唯一性、大小写冲突、未知/缺失字段、类型和编码检查，再产生无阶段副作用的 normalized decision。P1、Module pre-commit、Module pre-push 只负责装载阶段输入、调用共享 validator 和保留各自阶段专属 hard-block；F-0115/F-0116/F-0117/F-0143 历史路径与 finding codes 保持原样。

**Tech Stack:** Windows PowerShell 5.1、PowerShell 7 parser compatibility、Git staged/commit topology、YAML/Markdown governance records、disposable shared/sparse Git fixtures。

## Execution Identity

- taskId: `p1-mechanism-execution-compatibility-v2-1-2026-07-19`
- taskKind: `mechanism_hardening`
- priority: `governance`
- branch: `codex/p1-mechanism-execution-compatibility-v2-1`
- worktree: `D:/tiku/.worktrees/p1-mechanism-execution-compatibility-v2-1`
- baseSha: `61303d935e58e65103563fcb0fa865d7bfb6cf3e`
- productClosureContribution: `none`
- findingIds: `[]`
- mechanismBudgetStart: `2026-07-19T06:35:11.5416933-07:00`
- focusedGreenDeadline: `2026-07-19T08:05:11.5416933-07:00`
- c3ResumedFocusedBudgetStart: `2026-07-19T08:03:58.1040109-07:00`
- c3ResumedFocusedGreenDeadline: `2026-07-19T09:33:58.1040109-07:00`
- c6AdditionalBudgetStart: `2026-07-19T12:01:43.3166301-07:00`
- c6AdditionalBudgetDeadline: `2026-07-19T14:01:43.3166301-07:00`
- c6RecoveryBudgetStart: `2026-07-19T16:10:05.7682473-07:00`
- c6RecoveryBudgetDeadline: `2026-07-19T18:10:05.7682473-07:00`
- c6PostBlockedBudgetStart: `2026-07-19T18:16:12.9670681-07:00`
- c6PostBlockedBudgetDeadline: `2026-07-19T20:16:12.9670681-07:00`
- c6FocusedPerformanceBudgetStart: `2026-07-19T21:07:16.0650764-07:00`
- c6FocusedPerformanceBudgetDeadline: `2026-07-19T22:07:16.0650764-07:00`
- authorization: current user approval of the complete P1 mechanism execution compatibility charter v2.1, followed by fresh approval of a one-time non-finding-specific bootstrap transition that atomically closes F-0143 and materializes this `mechanism_hardening` successor with `findingIds: []` and `productClosureContribution: none`.
- resumedBudgetAuthorization: current user fresh approval for the same `mechanism_hardening` task to receive a new 90-minute focused budget beginning at C3; C0-C2 evidence, the frozen file set and every permission/safety boundary remain unchanged.
- standingAuthorizationSource: `docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md`
- closeoutPolicy: task-scoped local commit, ff-only merge to `master`, ordinary push to `origin/master`, and cleanup are approved; PR, force push and deploy remain blocked.

## Product Resume Anchor

- goalThreadId: `019f6aba-36d8-73f1-88f5-a5aa1a562af4`
- goalObjective: 以 P0 冻结后的当前代码基线为起点，对 125 个 P1 finding 按根因依赖顺序执行即时二级对抗复检、整改、测试、两轮复核、证据、独立提交、ff-only 合入、推送和隔离资源清理；WIP=1。全部 P1 完成后执行全局静态回归、重新校准 P2 影响映射并冻结 P1 静态基线。本 Goal 不包含 P2 实现、21 项运行时验收、PR、部署或真实外部 Provider/数据库操作。
- productTaskId: `p1-remediation-rc-02-employee-personal-ai-context-2026-07-18`
- findingId: `F-0143`
- productBranch: `codex/p1-rc02-employee-personal-ai-context`（已清理，不得重建）
- productWorktree: `D:/tiku/.worktrees/p1-rc02-employee-personal-ai-context`（已清理，不得重建）
- productBaseSha: `0fe8edae7a7efc00154f5c54227623be55796983`
- productCommit: `e46e4340c`
- readyTransitionCommit: `12c348de2`
- closeoutBlockerEvidenceCommit: `61303d935e58e65103563fcb0fa865d7bfb6cf3e`
- completedStages: implementation、RED→GREEN、完整静态验证、两轮对抗审查、产品提交、`in_progress -> ready_for_closeout`、ff-only merge、普通 push、产品 worktree/短分支清理。
- nextUnexecutedProductCommand: 在 C7 恢复原 Goal 后运行 `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Get-TikuNextAction.ps1`，按 ledger/DAG 做下一 finding JIT preflight；不得重做 F-0143，下一产品 RED 在机制 closeout 与恢复 transition 完成前不得开始。
- resumeMeaning: 保持已清理的 F-0143 branch/worktree 不存在；恢复的是原 P1 Goal、WIP=1 状态机、下一 finding 选择入口和未执行命令，不是重建 F-0143 产品隔离区。

## C0 Preflight Facts

- preflightCheckedAt: `2026-07-19T06:35:01.7834783-07:00`
- `HEAD == master == origin/master == live origin/master == 61303d935e58e65103563fcb0fa865d7bfb6cf3e`。
- `master` clean；仅主 worktree；无 F-0143、热修或机制残留分支/worktree；无运行中 Subagent。
- `.worktrees/` 由 `.gitignore` 忽略；当前 checkout 不是 linked worktree 或 submodule。
- 合法启动路径：当前用户 fresh 批准的一次性、非 finding-specific bootstrap transition；它只允许原子关闭 F-0143、物化本 `mechanism_hardening` successor、允许空 `findingIds` 且明确 `productClosureContribution: none`。它不得成为普通 task transition、普通 `in_progress` SHA drift、product closure 或任意 finding 的通用绕过。
- 第一项持久化仓库变更是本计划；在本计划及 checkpoint 表落盘前没有修改 parser、guard、smoke、state/queue 或产品文件。

## C0-C7 Recoverable Checkpoint Table

每次进入 checkpoint 前，主线程必须重新读取本文件并核对 `Allowed Files`、`Blocked Files And Actions`、`Safety Invariants`、预算和 freshness inputs。每个 checkpoint 必须在 evidence 的 checkpoint ledger 中记录 candidate SHA 或 normalized candidate tree hash、base SHA、实际 changed files、freshness key、真实命令/exit code/duration、用例计数、剩余预算、stale/retry 次数、未决风险和下一唯一入口。

| Checkpoint                 | Durable status | Entry                                          | Exit criteria                                                                                                                                    | Next unique entry                                        |
| -------------------------- | -------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| C0 Preflight               | `pass`         | fresh bootstrap approval + clean/synced master | productResumeAnchor、合法启动路径、完整计划、授权、精确文件冻结、预算、唯一 stop condition 全部落盘；未改生产语义                                | 重读本计划后进入 C1 characterization                     |
| C1 Characterization        | `pass`         | C0 exit                                        | 历史行为、路由、finding codes 与负例已固定；bootstrap/完整投影 RED、one-time GREEN 和主线程复审通过                                              | 重读本计划后进入 C2 contract RED                         |
| C2 Contract RED            | `pass`         | C1 exit                                        | 一个 exact positive 与 69 个数据驱动负例已定义；matrix 自检后在缺失 shared contract/parser/decision 处得到 attributable RED；主线程复核通过      | 重读本计划后进入 C3 shared decision GREEN                |
| C3 Shared Decision GREEN   | `pass`         | fresh C3 budget approval                       | 严格 parser、唯一 canonicalizer、共享 validator、normalized decision focused GREEN；主线程对抗复核通过                                           | 重读本计划后进入 C4 thin adapters                        |
| C4 Thin Adapters GREEN     | `pass`         | C3 exit                                        | 三个适配器核心结论/finding codes 一致，阶段专属 hard-block 与历史入口保持                                                                        | 重读本计划后进入 C5 evidence/profile RED                 |
| C5 Evidence/Profiles GREEN | `pass`         | C4 exit                                        | 机器证据、四层 profile、freshness key、同 key 去重 focused GREEN；主线程复审 Critical/Important 均清零                                           | 重读本计划后进入 C6 full/review                          |
| C6 Full/Review             | `pass`         | C5 exit + current fresh performance approval   | focused `<=180s`、串行 full/post-full、主线程对抗复核与独立最终复核均通过；production review 仍 `PENDING`                                        | state/queue-only ready transition                        |
| C7 Closeout/Resume         | `pending`      | C6 exit                                        | 精确提交、ready transition、ff-only、普通 push、清理、terminal closeout evidence、机制指标模板、原 P1 Goal 和下一命令恢复；下一产品 RED 尚未开始 | 先创建机制提交，再进行 state/queue-only ready transition |

## Allowed Files

以下集合在 C0 冻结；扩大任一项必须触发唯一 stop condition，不得边跑边扩。

1. `docs/04-agent-system/operating-manual.md`
2. `docs/04-agent-system/sop/p1-approved-same-task-transition.md`
3. `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
4. `docs/04-agent-system/state/p1-approved-same-task-transition-schema-v1.yaml`
5. `docs/04-agent-system/state/project-state.yaml`
6. `docs/04-agent-system/state/task-queue.yaml`
7. `docs/05-execution-logs/acceptance/2026-07-19-p1-mechanism-execution-compatibility-v2-1-authorization.md`
8. `docs/05-execution-logs/task-plans/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md`
9. `docs/05-execution-logs/evidence/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md`
10. `docs/05-execution-logs/audits-reviews/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md`
11. `scripts/agent-system/P1ApprovedSameTaskTransition.Common.ps1`
12. `scripts/agent-system/Test-P1ApprovedSameTaskTransition.Smoke.ps1`
13. `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
14. `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
15. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
16. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
17. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
18. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`

## Blocked Files And Actions

- `AGENTS.md`、`.husky/**`、`package.json`、所有 lockfile、`src/**`、`tests/**`、`e2e/**`、`drizzle/**`、`migrations/**`、`seed/**`、`src/db/**`、`.env*`、secret/token/credential、`D:/tiku-readonly-audit/**`。
- 无 product source/test、schema/migration、数据库连接/读取/写入/执行、Provider、runtime/browser、P2、PR、force-push、deploy、依赖引入、权限扩张、Cost Calibration Gate。
- 不建设缓存服务、数据库、常驻进程、通用调度器、workflow engine、closeout orchestrator 或新治理平台。
- 不迁移、删除、归档或改写 F-0115/F-0116/F-0117/F-0143 历史 hardcoded path、finding codes、对抗负例；至少观察三个后续 P1 产品任务后才能另立评估任务。
- 不让 focused 代替 commit/merge/push/closeout 真实门禁；不跨 freshness key、阶段或受影响 SHA 复用结果。
- 不把机制提交、状态 transition 或 focused GREEN 解释为任何产品 finding 已完成。

## Safety Invariants

1. WIP 始终为 1；bootstrap transition 原子关闭 F-0143 并物化唯一 mechanism successor，不能出现双 active task。
2. mechanism successor 的 `findingIds` 必须为空、`productClosureContribution` 必须为 `none`；其 closed 状态不得增加 completed finding identity。
3. 错误 task/parent/base/branch/projection、缺失/额外/重复/乱序/大小写变体文件、D/R/C/未知 status、multi-parent、multi-commit、replay、产品夹带、授权缺失/重复/冲突、机器证据损坏全部 fail closed。
4. 合同不得自我授权；通用 transition 的 authorization/standing authorization 必须存在于 base SHA 的任务级 approval/closeoutPolicy。当前 bootstrap 是用户 fresh 批准的一次性启动通道，不可复用于未来合同实例。
5. 专用候选采用宽识别、严验证；任何 marker、reserved transitionType、contract path、候选 projection、大小写变体或半成品均进入严格路径，不得回落 generic/legacy/standard。
6. ordinary `in_progress` SHA drift 永远 hard-block；standard mode 永远不能获得 transition-only ancestor checkpoint；仅完整通用合同或 exact bootstrap 通过后允许精确一次 ancestor checkpoint。
7. 既有 P1/P0/Module/ContentAdmin/closeout/敏感信息门禁与历史负例不得减少、降级或更名导致兼容性破坏。
8. 完整 name-status 基于 Git 原始记录，只接受 A/M；ordinal case-sensitive；同时校验 raw count、case-sensitive unique count、expected count 和 canonical exact ordered paths。
9. Git topology fail closed：错误 base/branch、远端基线不匹配、非单父、超过一个候选提交、ancestor 不匹配、已消费 transitionId 均拒绝。
10. 任一不变量失败时禁止 commit、merge、push 或 cleanup。

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/` 中 ADR-001 至 ADR-007
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/p1-remediation-efficiency-loop.md`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md`

## Requirement Decision Map

- 本任务不定义或改变产品需求、authorization 业务语义、edition、quota、schema 或 runtime 行为。
- 需求层决定仅为治理执行兼容：queue/state 仍是任务状态 SSOT；evidence 记录观察事实；audit 记录复核结论；scripts 输出是派生决策。
- 当前用户 v2.1 章程和 fresh bootstrap approval 是任务范围与启动授权；它们不成为未来合同的自授权来源。
- 项目 Post-Closeout SHA Rule 解决自指 SHA：candidate 使用 normalized candidate tree hash；最终 terminal push/cleanup 事实由 C7 resume-transition evidence 记录，最后一个不可自指的 push/cleanup 结果同时进入最终 handoff，不创建无限 state-sync 链。

## Requirement Mapping

- 状态/队列：WIP=1、F-0143 closeout、无 finding mechanism successor、resume successor transition。
- 安全：共享 validator 只收敛重复判断，不删除阶段专属 hard-block。
- 证据：机器块与人类说明解耦；真实命令、exit code、duration、counts、hashes 先于结论。
- 效率：focused/contract-only/full/docs-only 四层；freshness key 决定受影响重跑；同 key 成功 full 最多采信一次。
- 后续三任务：仅交付模板、公式、记录位置和恢复入口，不伪造尚未发生的结果。

## Evidence-Only Sources

- F-0115、F-0116、F-0117、F-0143 的 scope-correction/spec-transition/closeout lifecycle plan、authorization、evidence、audit。
- F-0143 产品 evidence/audit 和 `61303d935` closeout blocker 记录。
- 上述 execution logs 仅用于 characterization、耗时和历史行为，不替代 requirement SSOT 或当前用户授权。

## Conflict Check

- v2.1 章程最初要求不存在额外 bootstrap hotfix；现有 P1 状态机无法表示无 finding mechanism successor。用户随后 fresh 批准一次性、非 finding-specific bootstrap transition，精确解除该启动冲突；其他约束不变。
- “C7 evidence 记录最终 closeout”与 commit/push/cleanup 的自指不可同时在最后一个被推送 commit 内完成。解决方式是：机制 evidence 记录 normalized candidate tree hash、机制 commit/ready transition 和预定终端路径；恢复 successor transition 的独立 evidence 记录已经发生的机制 merge/push/cleanup；最后一个 successor push/cleanup 的不可自指事实按现行 SOP 写入最终 handoff。不得伪造未来结果或制造无限同步提交。
- 未发现需要产品需求对齐、依赖、数据库、Provider、runtime、P2 或部署授权的冲突。

## Characterization Inventory (C1)

在任何通用生产实现前固定：

- 全部 F-0115/F-0116/F-0117/F-0143 historical exact constants、candidate priority、review anchors、finding codes、positive/negative cases。
- generic/legacy/standard 路由优先级；保留 marker 的宽识别与损坏候选不可 fallback。
- standard、ordinary `in_progress` drift、exact ancestor checkpoint、单父/多父、单提交/多提交、replay、exact ordered file-set 与 A/M-only 语义。
- P1 现有职责：program/state/queue/WIP/finding partition、scope、transition、review、Git push 输出。
- Module pre-commit 专属职责：task allowed/blocked scope、SSOT、sensitive evidence、terminology、staged file status。
- Module pre-push 专属职责：remote/update topology、ancestor、one commit/parent、clean tree、stage-specific readiness。
- 重复逻辑清单必须指出 contract parsing、authorization、exact files、task/base/branch/projection/topology/replay/ordinary drift 应进入共享层；上述阶段专属职责不得移动。
- bootstrap characterization RED：旧 P1 guard 对本 task plan 返回 `P1_PROGRAM_ALLOWED_FILES_VIOLATION`，对完整机制文件集返回 `P1_PROGRAM_SCOPE_SELF_MODIFICATION_WITH_IMPLEMENTATION_CHANGE` 和 guard/smoke blocked-file findings；这证明 fresh bootstrap path 必须精确实现而非 bypass。

## Generic Contract RED Matrix (C2)

一个 exact positive，加以下全部负例；三个适配器必须返回一致的核心 normalized decision/finding codes，并保留阶段专属 finding：

- 缺失、同值重复、冲突重复、仅大小写不同的字段 key/value；重复机器块、多余块、未知字段、缺失字段、类型错误、UTF-8/BOM/非法编码、格式损坏。
- wrong transitionType/transitionId/taskId/parentTaskId/baseSha/branch/authorization/standing authorization/state projection/queue projection。
- missing/extra/duplicate/reordered/case-variant files；raw count/unique count/expected count 不一致；D/R/C/unknown status；product file。
- standard mode、ordinary drift、multi-parent、multi-commit、wrong ancestor、remote baseline mismatch、replay/consumed transitionId、unauthorized ancestor。
- reserved marker、contract path、candidate projection、case variant 或半成品必须进入 strict route，不得回落 generic/legacy/standard。
- authorization 只存在于 candidate、自写 `Status: approved` 或 candidate closeoutPolicy，不得产生权限。

## Strict Contract And Parser (C3)

### Canonical line format

唯一 fenced block 名称为 `tiku-approved-same-task-transition-v1`。块内每行是 UTF-8、无 BOM、LF 的 `key=value`；空行、前后空白、注释、转义自由文本和未知 key 均拒绝。标量 key 必须各出现一次并 ordinal case-sensitive；仅大小写不同也算冲突。文件由连续三位索引表达：`file.001.path`、`file.001.status`，索引必须从 `001` 连续且与 `fileCount` 相等。

Required scalar keys:

```text
schemaVersion
transitionType
transitionId
taskId
parentTaskId
baseSha
branch
authorizationId
authorizationSource
standingAuthorizationSource
statePath
stateFromSha256
stateToSha256
queuePath
queueFromSha256
queueToSha256
fileCount
singleParent
singleCommit
oneTime
ancestorCheckpointPolicy
ordinaryDriftPolicy
standardModePolicy
databaseExecutionPolicy
permissionExpansionPolicy
```

Exact enum/value rules:

```text
schemaVersion=1
transitionType=approved_same_task_transition
singleParent=true
singleCommit=true
oneTime=true
ancestorCheckpointPolicy=transition_only_exact_one_parent
ordinaryDriftPolicy=hard_block
standardModePolicy=hard_block
databaseExecutionPolicy=blocked
permissionExpansionPolicy=blocked
file.NNN.status=A|M
```

### Shared interface

`scripts/agent-system/P1ApprovedSameTaskTransition.Common.ps1` produces these functions without stage side effects:

```powershell
Read-P1ApprovedSameTaskTransitionContract -Text <string> -SourcePath <string>
Get-P1ApprovedSameTaskTransitionCanonicalFiles -NameStatusRecords <object[]>
Get-P1ApprovedSameTaskTransitionCandidateTreeHash -Facts <hashtable>
Get-P1ApprovedSameTaskTransitionFreshnessKey -Facts <hashtable> -Profile <string> -Command <string>
Test-P1ApprovedSameTaskTransition -Contract <object> -Facts <hashtable>
Read-P1TransitionMachineEvidence -Text <string> -SourcePath <string> -Facts <hashtable> -Command <string>
```

`Test-P1ApprovedSameTaskTransition` returns a stable object containing at least:

```text
recognized
valid
mode
transitionId
candidateIdentity
baseSha
normalizedFiles
findingCodes
freshnessInputs
facts
```

Core finding codes are stable, uppercase and shared: `P1_AST_CONTRACT_BLOCK_INVALID`、`P1_AST_FIELD_INVALID`、`P1_AST_AUTHORIZATION_INVALID`、`P1_AST_CONTEXT_INVALID`、`P1_AST_PROJECTION_INVALID`、`P1_AST_FILE_SET_INVALID`、`P1_AST_TOPOLOGY_INVALID`、`P1_AST_REPLAY_BLOCKED`、`P1_AST_ORDINARY_DRIFT_BLOCKED`、`P1_AST_STANDARD_MODE_BLOCKED`。适配器可加阶段前缀，但 core code 列表必须一致。

## Thin Adapters (C4)

- P1 adapter：装载 program/current task/state/queue/phase/Git inputs，调用共享 validator；继续独立执行 P1 counts、WIP、finding partition、audit repository、product scope、pre-push ref 与历史 exact paths。
- Module pre-commit adapter：装载 TaskId/index name-status/task allowed/blocked/SSOT/sensitive evidence inputs；调用共享 validator；继续执行 Module scope、text/sensitive/terminology、requirement mapping 和 staged divergence 检查。
- Module pre-push adapter：装载 TaskId/P1TransitionScopeMode/HEAD/origin/update lines/name-status/topology；调用共享 validator；继续执行 remote、clean tree、one push update、Module readiness 和阶段 topology。
- adapter 只映射 shared decision/finding codes，不复制 raw parser、authorization、exact file、projection、topology、replay 或 ordinary drift 判断。
- 历史入口和三套 smoke 保持兼容；未来正常 transition 只改合同实例和 task state，不再改六个 guard/smoke。

## Machine Evidence Schema (C5)

唯一 fenced block 名称为 `tiku-transition-evidence-v1`，复用相同 raw parser discipline。Required keys：

```text
schemaVersion
recordType
taskId
transitionId
authorizationId
authorizationSource
baseSha
candidateIdentityType
candidateIdentity
branch
stateFromSha256
stateToSha256
queueFromSha256
queueToSha256
reviewDecision
validationProfile
freshnessKey
commandCount
positiveCount
negativeCount
validatorSha256
p1AdapterSha256
preCommitAdapterSha256
prePushAdapterSha256
fixtureSha256
fileCount
```

- `recordType=transition_evidence`；`candidateIdentityType=normalized_tree_hash|commit_sha`。机器 `reviewDecision` 必须与候选外部、不可从机器块或 Markdown prose 反推的 `ReviewDecision` exact match；`ReviewInputKind=production|synthetic` 必须由调用者显式提供。真实 audit 未 `APPROVE` 时，fixture 只能通过显式 synthetic facts 测试批准路径，不能改真实 audit 状态。
- `command.NNN.name|exitCode|durationMs` 和 `file.NNN.path|status` 必须连续、计数一致、唯一、ordinal case-sensitive；exit code/duration/count 必须是非负十进制。
- machine metadata 必须与可信 task/transition/authorization/base/branch/schema/state/queue/profile/hash facts exact bind；machine files 必须与可信 `NameStatusRecords` 的 count、raw order、ordinal path 和 A/M status 完全一致。事实缺失、类型错误、extra/missing/reordered/case/status drift 全部 fail closed。
- normalized candidate tree hash 对 exact name-status、每个文件 SHA-256 和将机器块中 `candidateIdentity`/`freshnessKey` 规范化为空值后的内容计算，避免自指；定义和测试必须唯一。
- production validator 只消费机器块，不依赖 Markdown 标题、段落措辞、reviewer 文案或自然语言 regex；人类说明继续保留。

## Validation Profiles And Freshness Key (C5)

### focused

- parser、shared validator、bootstrap、三个 adapter 核心 positive/negative matrix。
- 开发循环只运行受影响 focused cases；目标单次 `<= 180s`。
- 命令：`powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1ApprovedSameTaskTransition.Smoke.ps1 -Profile focused`。

### contract-instance-only

- 未来只新增合同实例/状态投影时：strict contract lint、focused matrix、真实 staged pre-commit、真实 committed pre-push、产品任务质量门禁。
- 不运行三套完整机制 smoke。

### full

- parser/shared validator、生产 adapter、fixture/harness 或门禁语义变化时触发。
- 本机制任务代码冻结后串行且同一 freshness key 仅一次有效运行完整 P1 smoke、Module pre-commit smoke、Module pre-push smoke；补 P1 manual、P0、当前 Module、format、diff check。

### docs-only

- machine schema/parser/guard/fixture 均未变时：strict machine block parse、scoped format/diff 和受影响短门禁；不跑完整机制矩阵。

### Freshness key

SHA-256 输入必须按固定字段顺序和 LF 编码包含：candidate commit SHA 或 normalized candidate tree hash、base SHA、contract schemaVersion、parser/shared-validator hash、P1 adapter hash、pre-commit adapter hash、pre-push adapter hash、fixture version/hash、state relevant projection hash、queue relevant projection hash、profile、exact command。任一受影响输入变化自动 stale；key 相同的成功 full 最多采信一次。重型 full 串行；运行中受影响文件变化则标记 stale，代码再次冻结后只重跑一次。

## Metrics Template For The Next Three P1 Product Tasks

记录位置：`docs/04-agent-system/sop/p1-approved-same-task-transition.md` 提供模板；后续每个产品 task 的 evidence 增加 `## P1 Mechanism Efficiency Observation`，C7 resume-transition evidence 指向该入口。当前任务只交付模板、公式和恢复入口，不填写未来结果。

```text
productTaskId=
productValueTimeMs=
mechanismOverheadMs=
totalTaskTimeMs=
mechanismOverheadRatio=
implementerSubagentCount=
finalReviewerSubagentCount=
mechanismScriptChangedLines=
focusedRunCount=
focusedP95Ms=
fullSmokeRunCount=
sameFreshnessKeyFullRunMax=
staleCount=
retryCount=
sixGuardSmokeModificationCount=
classificationNotes=
```

- `productValueTime = product analysis + product code + product tests`。
- `mechanismOverhead = mechanism work + mechanism-only validation wait + mechanism-only review/closeout`；因机制暂停产品的诊断、重复命令、等待和 Subagent 协调均计入。
- shared validation 按真实触发原因归类；只为机制合同运行则计入 mechanismOverhead。
- 连续三个任务观测：六脚本改动次数 0；contract-only 完整三 smoke 次数 0；focused P95 `<=3m`；同 key full `<=1`；每任务最多一实施者和一 final reviewer；ratio 目标 `<=25%-30%` 且 mechanismOverhead < productValueTime。
- 连续两个任务机制耗时仍高于产品价值，或任一任务再次要求修改六脚本，则停止扩展、先做根因复盘和最小修正。

## Subagent And Review Policy

- 最多一个 implementation Subagent；它只接收当前 checkpoint brief 和本计划路径，负责 C1-C5、bootstrap RED/GREEN、所有 review fixes；不得重新解释整章程或扩大设计。
- 主线程在每个 checkpoint 进入前重读本计划，逐文件做规格符合性和对抗式复核，维护 evidence checkpoint ledger。
- C6 仅一次独立最终 reviewer；候选冻结。Critical/Important 修正返回同一 implementer；修正后 reviewer 重审。不得创建机械修正 Subagent。
- 任何受影响文件变化会使对应 review/validation stale；必须重新计算 freshness key 并只补跑受影响 profile。

## Implementation Tasks

### Task 1: C0 bootstrap plan and authorization

**Files:** 本计划；随后在确认本计划完整后才允许创建 authorization/evidence/audit/state/queue 和 bootstrap RED。

**Interfaces:** Consumes current user bootstrap approval and F-0143 closeout facts. Produces a recoverable task envelope with exact scope, productResumeAnchor and stop condition.

- [x] 创建隔离 worktree，记录 base、branch、budget start。
- [x] 将完整 v2.1 MUST/MUST-NOT、C0-C7、profiles、预算、stop condition 和恢复锚点写入本计划，且这是首个仓库内容变更。
- [x] 主线程自审本计划：无 placeholder、范围无缺失、所有路径精确、Conflict Check 完整。
- [x] 创建 exact authorization/evidence/audit skeleton；evidence 将 C0 ledger 写为 pass 后，才更新 C0 status。

### Task 2: C1 characterization

**Files:** shared smoke 与三套既有 smoke；evidence ledger。

**Interfaces:** Produces immutable characterization cases and duplicate-logic inventory; no generic contract production change.

- [x] 将 Characterization Inventory 各项写成 marker/behavior tests。
- [x] 在 smoke 写 bootstrap RED，证明旧实现无法原子关闭 F-0143 并物化空 finding mechanism successor；不得先改生产 guard。
- [x] 最小 bootstrap GREEN 仅允许本 task/base/branch/exact files/WIP transition；空 finding 例外只对 `taskKind=mechanism_hardening` 且 `productClosureContribution=none`，不进入 completed finding identities。
- [x] 运行 focused characterization，记录 command/exit/duration/count/hash；原 73-case GREEN 因 projection review finding 已 stale。
- [x] 证明历史 paths/codes 与 ordinary drift/standard/topology/file-set 负例不变，并补 state/queue 完整原子投影负例。

### Task 3: C2 strict contract RED

**Files:** `Test-P1ApprovedSameTaskTransition.Smoke.ps1` 与必要的三 adapter smoke fixture。

**Interfaces:** Produces the complete Generic Contract RED Matrix against absent shared implementation.

- [x] 写 exact positive 和全部 raw parser/auth/context/projection/file/topology/replay/fallback negatives。
- [x] 逐项验证 RED 是缺失 shared contract/decision，而非 parser syntax、fixture 或 Git setup 错误。
- [x] 将 RED count、duration、finding expectation 写 evidence。

### Task 4: C3 shared decision GREEN

**Files:** schema、shared common script、shared smoke、SOP、evidence。

**Interfaces:** Produces the exact shared functions and normalized decision described above.

- [x] 实现 raw block scanner、strict field parser、ordinal canonicalizer、projection/file/topology/auth/replay validator。
- [x] 实现 normalized tree hash 和 core finding codes；无阶段副作用。
- [x] 运行 focused GREEN，确认 parser/validator matrix 全部通过且 `<=180s`；超过预算直接执行 stop condition。

### Task 5: C4 thin adapters

**Files:** three production guards and three smoke files plus shared common script/evidence。

**Interfaces:** Consumes normalized decision; produces stage mapping while retaining stage-only hard blocks.

- [x] 先让 adapter consistency tests RED，再最小接入 shared validator。
- [x] 未来通用路径只调用唯一 shared parser/validator；未删除、迁移或改名任何历史 hardcode、finding code 或阶段专属检查。
- [x] focused GREEN 通过完整 P1 pre-commit、Module pre-commit、合入后 `master` checkout 上的 P1 pre-push 与 Module pre-push disposable Git 链路，而不只验证 StageInputs/shared decision。
- [x] 三轮主线程对抗审查发现的 complete-guard 投影、UTF-8、bootstrap 精确排除、真实 `master` pre-push、同路径与跨路径 `transitionId` replay 问题均由同一实施者完成 RED/最小修复/GREEN。
- [x] 主线程在八个 behavior hash/mtime 冻结后 fresh 运行 focused：`exit 0`、`165.8s`、`589` cases、五个 stage markers 全通过；Critical/Important 均为 `0`，C4 review pass。

### Task 6: C5 machine evidence and profiles

**Files:** schema、shared common/smoke、SOP、operating manual、mechanism index、evidence/audit。

**Interfaces:** Produces strict machine evidence parsing, four profiles, deterministic freshness and metrics template.

- [x] 先写 duplicate/case/unknown/missing/damaged/review-pending/freshness invalidation RED。
- [x] 实现 evidence parser、freshness key、profile selector；禁止任何服务、数据库、daemon 或 scheduler。
- [x] focused GREEN；记录 profile、commands、counts、hashes、stale/retry；等待主线程 C5 对抗复审，C6 仍禁入。
- [x] C5 主线程返修：外部 review fact 与 production/synthetic kind 明确绑定，机器块不能自写批准。
- [x] C5 主线程返修：全部可信 metadata/projection/schema facts 与 exact `NameStatusRecords` count/order/path/status fail-closed 绑定。
- [x] 格式化累积 evidence，保留旧 stale command 并记录返修后的最新 accepted focused run；重算 normalized identity/freshness 后交回主审。
- [x] 主线程 frozen diff 对抗复审通过并 fresh 运行 focused：`exit 0`、`156.5s`、`719` cases、五 markers 全通过；Critical/Important 均为 `0`，C5 durable status=`pass`。

### Task 7: C6 full validation and review

**Files:** frozen exact 18-file candidate only。

**Interfaces:** Produces one valid full freshness key, main-thread adversarial review and one independent final review.

- [x] 保留首个 P1 full smoke RED：`exit 1` / `17.9s`，historical standard/no-diff pre-push fixture 因 conditional empty output 解包为 null 后触发严格参数绑定失败。
- [x] 先在 shared focused smoke 增加 P1/Module pre-commit/pre-push empty name-status 快速回归，再最小把 P1 conditional assignment 改为外层数组捕获；Module 两个直接 assignment 保持原样。
- [x] fresh focused `exit 0` / `155.533s` / `726` cases，五 markers 全通过；PowerShell parser、diff、process、scope/hash 冻结通过，等待主线程返修复核。
- [x] C6 主线程发现机器块错误复用变更前 C5 `APPROVE` 及重复、矛盾的 next-entry；同一实施者完成 docs-only `PENDING` 对齐与单一时间序，主线程确认 `Critical=0 open`、`Important=0 open`。
- [x] 保留第二个 P1 full RED：`exit 1` / `664.815s`，empty-name-status 已通过，cross-repository Git-index fixture 在 dirty source mechanism task 上执行 manual audit，真实 guard 正确拒绝缺失 scope-freeze review/transition controls。
- [x] shared focused 先以 `exit 1` / `1.319s` / case `108` 锁定 source-worktree 耦合，再仅把 full-smoke fixture 改为已提交 scope-frozen product snapshot 加独立 foreign-index repo；未改 guard、未给 mechanism task 伪造评审、未允许 manual bootstrap transition。
- [x] fixture 返修后 fresh focused `exit 0` / `156.025s` / `734` cases，五 markers 全通过；主线程确认 `Critical=0 open`、`Important=0 open`，仅允许进入首条 P1 full。
- [x] 保留第三个 P1 full RED：`exit 1` / `637.149s`；cross-repo empty/null 已通过，但 minimal transition remote 缺 canonical pointers、frozen artifacts 和 standing authorization，真实 manual guard 正确 fail closed。
- [x] targeted runtime 以 system TEMP 下固定 base `61303d935e58e65103563fcb0fa865d7bfb6cf3e` 的 `--no-local` / no-alternates clone 验证：缺 authorization RED，恢复 exact clean base 后真实 manual `pass/standard`；foreign index 属于独立 committed repo。
- [x] 仅把 full-smoke fixture 改为上述完整 committed baseline，并禁用 clone/foreign repo 的 maintenance、gc、fsmonitor；shared focused 只固化 source characterization，不冒充 runtime。
- [x] fresh focused `exit 0` / `159.160s` / `743` cases，五 markers 全通过；主线程确认 `Critical=0 open`、`Important=0 open`。production review 保持 `PENDING`，仅允许进入首条 P1 full。
- [x] 冻结代码并计算 normalized candidate tree hash/freshness key；不把 targeted/main-thread 诊断冒充独立最终批准。
- [x] 保留第四个 P1 full RED：`exit 1` / `636.934s`；主流程已到最终 cleanup，但完整 clone 位于长 `$smokeRoot` 下，outer `Remove-Item -Recurse -Force` 遇到长路径/child-disappeared race 后抛错并可能遮蔽主流程结果。
- [x] 仅修正 fixture cleanup：完整 manual clone 与 foreign-index repo 使用 system TEMP 下固定短前缀 GUID sibling；专用 helper 校验绝对路径和 TEMP/prefix 边界、有限重试、仅容忍 child disappearance，并最终硬断言 root 不存在；inner `finally` 先恢复 `GIT_INDEX_FILE` 再清理两个 sibling。生产 guard 不变。
- [x] 在 C6 recovery window 内 fresh 重跑 exact targeted runtime、Windows PowerShell focused 和静态冻结；过期窗口中的 targeted/focused 仅保留诊断 provenance，不作为当前 GREEN。
- [x] 保留第五个 P1 full RED：`exit 1` / `767.453s`；短 TEMP cleanup 已越过，历史 exact hotfix runtime 触发 `P1_PROGRAM_APPROVED_SAME_TASK_TRANSITION_INVALID`，后续 full matrix 未运行。
- [x] targeted RED 证明 6/6 公共历史候选源含 generic marker，且 P1、Module pre-commit、Module pre-push 三处均为 generic 先于 legacy claim；shared focused 固化全部冻结 legacy exact route、marker collision、extra/missing 不 claim，并仅用 exact route claim 抑制 generic 解释。fresh targeted `exit 0` / `1.1s`，fresh focused `exit 0` / `158.9s` / `821` cases。
- [x] 关闭主线程 Critical：selector 与三 adapter 的 claim 消费完整 raw name-status；只接受 A/M、raw count/ordinal unique count/exact path set 全等，D/R/C/unknown/malformed/duplicate/case/extra/missing 均不 claim。focused RED `exit 1` / `1.5s`；targeted GREEN `exit 0` / `0.9s`；Windows focused GREEN `exit 0` / `161.8s` / `901` cases；`c6StaleCount=6`。
- [x] 主线程 Critical re-review 通过：严格 raw parser、canonicalizer、count/Ordinal unique/exact paths、三 adapter 同一 raw 输入及全部负例逐项复核；`Critical=0 open`、`Important=0 open`。C6=`main_review_pass_full_pending`，下一唯一入口仅为首条 P1 full。
- [x] 保留第六个 P1 full RED：`exit 1` / `675.051s`；路由与 cleanup 均已越过，嵌套 Module pre-commit smoke 的 unborn Git fixture 因 raw loader 无条件执行 `git diff --cached ... HEAD` 产生三次 ambiguous `HEAD` fatal，既有显式 `ChangedFiles` scope 负例未输出预期 hard-block；后续矩阵未运行，`c6StaleCount=7`。
- [x] focused RED 固化 P1/Module pre-commit unborn 语义：无 `HEAD` 不得产生 fatal 或授权；存在 staged files 时必须使用 Git 原生 empty-tree 语义返回完整 A records；显式 `ChangedFiles` 仍命中既有 scope hard-block。RED=`exit 1` / `1.566s` / case `256`。
- [x] 仅修正两个 pre-commit raw loader：严格判定 `HEAD`；存在时 diff `HEAD`，不存在时以 empty tree 运行 cached name-status；Git stdout/stderr/exit 独立捕获，失败均 fail closed，禁止吞 stderr 或伪造空 records。Module pre-push 不变。
- [x] targeted GREEN=`exit 0` / `1.576s`；Windows focused GREEN=`exit 0` / `167.949s` / `915` cases / 五 markers（`<=180s`）；双 parser、scoped format、diff、18-file scope、process/root 与 strict production/PENDING identity freeze 完成，停在 `implementation_complete_review_pending`。
- [x] 主线程对抗复核 unborn 修复通过：shared Process capture、HEAD/unborn 分支、stderr/exit fail-closed、P1/Module 调用点、真实 Module scope hard-block、pre-push 不变及精确 18 文件均已核对；`Critical=0 open`、`Important=0 open`。未新增验证命令，C6=`main_review_pass_full_pending`。
- [x] 保留 post-blocked P1 full timeout RED：工具在 `900s` 上限终止进程，未取得脚本退出码。前段约 `634s` 后进入重复嵌套的完整 Module pre-commit smoke；该 smoke 独立耗时 `504.397s`，因此组合约 `1138s`，不是末段 Git/status 卡死。
- [x] 保留独立 Module smoke 诊断：命令未超时，但在 `504.397s` 后 `exit 1`；固定 F-0143 base `0fe8edae7a7efc00154f5c54227623be55796983` 的 fixture 错误复制当前 mechanism worktree 的 state/queue，导致正例投影漂移。超时遗留 TEMP 根已由主线程清理，相关进程为零。
- [x] focused RED 固化两项边界：P1 full 不得重复执行完整 Module full；F-0143 固定历史 fixture 必须从 base 精确投影 gate 与 SHA，当前候选仅提供 authorization/guard/smoke 文件。两次 RED 分别为 `exit 1 / 2.440s / case 257` 与 `exit 1 / 2.551s / case 261`。
- [x] 最小实现只修改两个目标 smoke，并由 shared focused smoke 固化：移除 P1 full 的 nested Module full 调用但保留 P1 自身三组 F0117 contract/source checks；F-0143 fixture 从固定 base 读取 state/queue 并精确应用 `waiting_for_spec_review -> satisfied` 与 SHA 投影。生产 guard/Common/schema 均未修改。
- [x] focused 时限门禁已由窄范围性能修正解除：保留所有断言、负例、守卫和证据门禁，最终 focused `exit 0 / 158.296s / 940 cases / 5 markers`，低于 `<=180s`。
- [x] fresh performance authorization：仅在冻结 18 文件内完成 TEMP 分段诊断、单一假设、先 RED 后最小实现；未减少任何断言、负例、守卫或证据门禁。
- [x] 性能修正使用自限 `60` 分钟窗口完成；未扩张权限，未触发 stop condition。
- [x] TEMP 内存插桩诊断 `exit 0 / 190.226s / 930 cases / 5 markers`：bootstrap complete-guard 段 `113.902s`，其中九次 negative clone `15.056s`、九次真实 guard `73.929s`；C4 complete-guard 段 `53.751s`。诊断后不再重复跑。
- [x] 单一最小假设：九个 bootstrap negative 复用一个严格 reset/clean/checkout 固定 base 的 sparse clone，保留九次真实外部 guard 与全部断言；focused 降至 `158.296s`。
- [x] 串行 fresh P1 full、Module pre-commit full、Module pre-push full 均通过，且未并行化。
- [x] P1 manual、P0 baseline、Module pre-commit/closeout/pre-push、PowerShell parser、format、`git diff --check`、exact scope 与 residue 检查均通过。
- [x] 主线程逐项攻击 Safety Invariants、bootstrap one-time、历史兼容、shared-vs-stage boundary、evidence truthfulness；Critical=0、Important=0。
- [x] 唯一 independent reviewer 完成完整 diff 复审：Critical=0、Important=0、Minor=0；无新问题。

### Task 8: C7 closeout and Goal resume

**Files:** exact candidate；ready transition 仅 state/queue；resume successor transition 使用下一产品任务自己的精确计划/证据/审查范围，不夹入本提交。

**Interfaces:** Produces reviewable mechanism commit, approved Git closeout, cleanup, terminal evidence and restored P1 Goal.

- [ ] 精确 stage 本任务文件，真实 pre-commit，创建一个边界清晰的机制/bootstrap implementation commit。
- [ ] state/queue-only `in_progress -> ready_for_closeout` transition，运行真实 pre-push。
- [ ] 从 clean master ff-only 合入，复用同 freshness key 已有 fresh evidence，仅运行未覆盖门禁；普通 push `origin/master`。
- [ ] 确认 live remote 同步后清理机制 worktree/短分支。
- [ ] 在独立 resume-transition 中记录已经发生的 mechanism commit/merge/push/cleanup、actual mechanismOverhead、focused/full counts/freshness key，原子关闭 mechanism task 并物化下一 dependency-ready P1 product task；该 transition 不开始产品 RED。
- [ ] 最后恢复 Goal thread/objective、核对 F-0143 不重做、运行 `Get-TikuNextAction.ps1` 只读确认下一命令；C7 最后一个必做动作是恢复原 P1 Goal。

## Full Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1ApprovedSameTaskTransition.Smoke.ps1 -Profile focused
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-mechanism-execution-compatibility-v2-1-2026-07-19
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-mechanism-execution-compatibility-v2-1-2026-07-19
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-mechanism-execution-compatibility-v2-1-2026-07-19 -SkipRemoteAheadCheck
npm.cmd run format:check
git diff --check
```

PowerShell parser 必须覆盖 shared script、shared smoke 和六个 guard/smoke。Full smoke 严格串行；不得并发争抢 CPU。

## Unique Stop Condition

原 focused 窗口的 stop condition 已在 C2 后如实触发。用户随后 fresh 批准同一任务从 C3 获得新的 90 分钟 focused 窗口。恢复后的唯一 stop condition：无法在上述冻结文件集和从 `2026-07-19T08:03:58.1040109-07:00` 起至 `2026-07-19T09:33:58.1040109-07:00`、且不削弱任一 Safety Invariant 的前提下达到 focused GREEN。C0-C2 证据和结论不得重写或重跑冒充新结果。

触发后立即停止：不新开分支、不新增机制能力、不新增 finding-specific 启动热修、不修改 blocked file、不继续 full smoke；只报告一个 blocker，包含规则、文件、失败命令、证据和最小后续决策。

### C4 Budget Renewal

用户于 `2026-07-19T09:13:32.3665744-07:00` fresh 批准同一 C4 checkpoint 的新 120 分钟窗口，deadline 为 `2026-07-19T11:13:32.3665744-07:00`。旧窗口的 entry、运行结果、stale/retry 与 Critical finding 均保留原义，不得被本续期覆盖。续期后的唯一 stop condition 是：无法在冻结 C4 九文件、既有 Safety Invariants 和新 deadline 内完成真实阶段输入自动装载、严格路由、三 adapter normalized core decision/codes 运行时一致并取得 fresh focused GREEN。C5 仍不得进入。

### C4 Critical-Fix Budget Renewal

用户于 `2026-07-19T09:52:58.1287898-07:00` fresh 批准同一 `mechanism_hardening` / C4 checkpoint 的新增 120 分钟窗口，deadline 为 `2026-07-19T11:52:58.1287898-07:00`。此前窗口、RED、stale 结果和 main-thread Critical finding 全部保留；C0-C3、冻结 files、权限与安全边界不变。本窗口只用于 C4 complete-guard Critical 修复与 fresh focused 验证，仍禁止进入 C5。

### C4 Complete-Guard Renewal 2

用户于 `2026-07-19T10:07:55.5710267-07:00` fresh 批准同一 `mechanism_hardening` / C4 checkpoint 的又一新增 120 分钟窗口，deadline 为 `2026-07-19T12:07:55.5710267-07:00`。此前全部窗口、RED、stale、Critical 与续期记录保持原义；C0-C3 证据、冻结文件集、权限、安全不变量均不变。本窗口仅用于当前 C4 complete-guard 返修、一个损坏未来 generic candidate 的 complete P1 pre-commit 负例、静态冻结和 fresh focused 验证；C5 继续禁入。

### C4 Complete-Guard Renewal 3

用户于 `2026-07-19T10:29:15.0008131-07:00` fresh 批准同一 `mechanism_hardening` / C4 checkpoint 再新增 120 分钟窗口，deadline 为 `2026-07-19T12:29:15.0008131-07:00`。此前全部窗口、RED、stale、Critical/Important、修正与续期记录保持原义；C0-C3 证据、冻结文件集、权限、安全不变量均不变。本窗口仅用于完成当前 C4 主线程对抗复核、必要的同实施者返修、静态冻结和 fresh focused 验证；未通过 C4 exit criteria 前仍禁止进入 C5。

用户原始批准未限定 checkpoint；上句的 C4 限定只约束 C4 尚未通过时不得越级。C4 于本窗口内通过后，剩余时间顺序结转到同一 `mechanism_hardening` 任务的 C5；不得并行、重开 C4、扩大 allowedFiles/权限或提前进入 C6。C5 entry 于 `2026-07-19T10:53:19.9342546-07:00` 核对剩余 `5755` 秒。

### C6 Additional Budget Renewal

用户于 `2026-07-19T12:01:43.3166301-07:00` fresh 批准同一 `mechanism_hardening` 任务再新增 120 分钟窗口，deadline 为 `2026-07-19T14:01:43.3166301-07:00`。此前全部窗口、RED、GREEN、stale/retry、review finding 与 checkpoint 证据保持原义；C0-C5、冻结 18 文件、权限与 Safety Invariants 均不变。本窗口只增加 C6 当前兼容性返修、fresh focused、代码重新冻结、串行 full validation 和 review 的可用时间；不得新建任务/分支、扩大设计或绕过门禁。focused GREEN 后的 full closeout 仍按原章程执行，不把时间续期解释为质量门禁豁免。

### C6 Recovery Budget Renewal

用户于 `2026-07-19T16:10:05.7682473-07:00` fresh 批准同一 `mechanism_hardening` 任务新增 120 分钟恢复窗口，deadline 为 `2026-07-19T18:10:05.7682473-07:00`。此前全部窗口、四次 P1 full RED、GREEN、stale/retry、review finding 与 checkpoint 证据保持原义；C0-C5、冻结 18 文件、权限、production review `PENDING` 与 Safety Invariants 均不变。本窗口只增加补录第四次 full RED、验证现有 fixture-only 修正、重算冻结 identity/freshness、完成 C6 串行验证与审查以及通过后按既有授权进入 C7 的可用时间；不得新建任务/分支、扩大设计、绕过门禁或把续期解释为产品关闭或质量门禁豁免。

### C6 Post-Blocked Budget Renewal

用户于 `2026-07-19T18:16:12.9670681-07:00` fresh 批准同一 `mechanism_hardening` 任务新增 120 分钟恢复窗口，deadline 为 `2026-07-19T20:16:12.9670681-07:00`。该窗口从 blocked Goal 的精确 C6 `main_review_pass_full_pending` 入口恢复，仅用于首条串行 P1 full、剩余 C6 串行矩阵、独立最终审查及全部 C6 门禁通过后的既有 C7 closeout；C0-C5、六次 full RED、unborn focused/static GREEN、冻结 18 文件、权限、production review `PENDING` 与 Safety Invariants 均不变。不得新建任务/分支、扩大设计、绕过门禁、放宽 ordinary SHA drift 或提前开始产品 RED。

### C6 Focused Performance Optimization Authorization

用户 fresh 批准在冻结 18 文件内做窄范围 focused 性能优化，明确禁止降低任何守卫或证据门禁。本次执行自限 60 分钟，从 `2026-07-19T21:07:16.0650764-07:00` 至 `2026-07-19T22:07:16.0650764-07:00`；自限预算只收窄执行，不构成权限扩张。允许动作仅为：TEMP 中的可重复分段计时、一个证据支持的最小假设、先失败的性能回归、最小实现、targeted 与 focused 验证。仍禁止 full、review、C7、commit、merge、push、生产 guard/Common/schema 语义弱化、断言/负例删除、命令并行化掩盖真实串行成本或扩大 18 文件。

### C6 Focused Performance GREEN

- [x] 性能回归先 RED：`exit 1 / 1.669s / case 272`，精确缺失项为 reusable bootstrap candidate reset；实现前未删负例或 guard。
- [x] 最小实现只改 shared focused smoke fixture helper/negative loop：九个 negative 共用一次 sparse clone，每轮严格 `checkout -B`、`reset --hard`、`clean -fdx` 后重建候选；九次真实 guard 与三类原负向断言全部保留。
- [x] AST targeted GREEN：`exit 0 / 0.406s`，9 cases、loop 内 clone=0、每例 guard call site=1、loop 外 reusable assignment=1。
- [x] fresh Windows focused GREEN：`exit 0 / 158.296s / 940 cases / 5 markers`，满足 `<=180s`；940=原 930 行为断言加 10 个性能回归断言。
- [x] 双 parser 均 0 errors，`git diff --check` exit 0，exact scope `18/18`；误构造的 WinPS parser PID 与其 TEMP fixture、此前诊断 TEMP roots/wrapper 已核对边界后清理。
- [x] 当前状态恢复为 `implementation_complete_review_pending`；production review 仍为 `PENDING`。本轮未运行 full、review、C7、commit、merge 或 push。

### C6 Focused Performance Main-Thread Adversarial Review

- [x] 主线程独立核对 `Set-BootstrapFixtureCandidate` 的 `checkout -B` → `reset --hard` → `clean -fdx` 顺序及固定 base 重建，确认每个 negative candidate 在复用 root 前隔离复位。
- [x] 独立 AST 检查确认 negative loop 恰有 9 个 case、loop 内无 clone、恰有一次 reset helper 调用、恰有一次真实 guard call site，三类原断言及授权泄漏断言仍在。
- [x] 独立静态检查确认双 parser 0 errors、exact scope `18/18`、`git diff --check` 通过、无并行化/guard bypass、无新增 TEMP/process 残留；生产 guard/Common/schema 未被本轮性能 patch 修改。
- [x] Main review decision: `pass`; Critical=0, Important=0。仅允许进入既有 C6 full 前的下一 review gate；独立 final reviewer、full、C7、commit、merge、push 仍未授权。

## Immutable Charter Restatement

### C6 First Serial P1 Full PASS

- [x] 主线程按既有顺序运行第一条 P1 full：`powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`。
- [x] 结果：`exit 0 / 670.343s / 15 positive / 81 negative`；此前六次 exit-code RED 与一次 `900s` timeout 历史均保留，不以本次 PASS 覆盖。
- [x] production review 继续为 `PENDING`；本次仅记录已发生事实，不解释为独立最终 review、C6 整体通过或 C7 授权。
- [ ] 唯一下一入口：串行运行 Module pre-commit full，即 `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`。该命令尚未在本次补录中运行；Module pre-push、其余 full、独立 review 与 C7 继续等待既有顺序门禁。

### C6 Module Pre-commit Full PASS

- [x] 首次 preflight 因 6 个近期 PowerShell/Git 进程而停止，没有把残留环境误判为可运行条件。
- [x] 主线程随后串行运行 Module pre-commit full：`powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`。
- [x] 结果：`exit 0 / 868.808s`；F-0117 scope smoke 与 Module hardening smoke 均通过。
- [x] 后续孤儿复核发现最后一个 Git PID `7020`，其父 PID `13224` 已消失，命令为 `git.exe -c core.hooksPath=NUL -c core.fsmonitor=false remote -v`；精确核对后仅终止该 PID。相关进程与 `tiku-p1-v21-*` / `tiku-c6m-*` / `tiku-c6i-*` roots 最终均为 `0`。
- [x] production review 保持 `PENDING`；该 PASS 只关闭 Module pre-commit full gate，不代表独立最终 review 或 C7 授权。
- [ ] 唯一下一入口：串行运行 Module pre-push full，即 `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`。本次补录未运行该命令或任何后续 full。

### C6 Module Pre-push Full RED

- [x] 主线程按顺序运行 Module pre-push full：`powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`。
- [x] 结果：`exit 1 / 289.182s`。F-0143 transition-only 预期 pattern 未命中；实际输出仅为 `HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT`，并明确报告 `master` / `origin` SHA drift。
- [x] 本次 full 标记为 `stale/RED`。ordinary SHA drift hard-block 是必须保留的安全行为；不得通过放宽 ancestor/checkpoint、伪造 transition authorization 或绕过 pre-push guard 取得 GREEN。
- [ ] 当前唯一入口：只读对比 F-0143 fixture 的 base/state/queue 与当前 `master` / `origin` checkpoint，形成一个证据支持的根因。根因明确前不得修改 guard、fixture 或运行后续门禁。

### C6 Module Pre-push F-0143 Fixture Correction GREEN

- [x] 根因：fixture 将 Git `master` / `origin/master` 固定在 `0fe8edae7a7efc00154f5c54227623be55796983`，却从当前机制 worktree 复制 state/queue（checkpoint 为 `61303d...`），未执行 fixed-base 的 gate 与 SHA 投影；真实 guard 因此正确先发普通 SHA drift hard-block。
- [x] Source-shape RED：focused `exit 1 / 1.648s / case 271`，精确失败为 pre-push fixed-base projection block 缺失。
- [x] 最小实现仅在 `Test-ModuleRunV2PrePushReadiness.Smoke.ps1`：current candidate copy 排除 state/queue；二者从 fixed base 读取，exact 投影 waiting→satisfied 及 SHA `4f63...`→`0fe8...`。ordinary SHA drift、transition-only 与全部原负例/断言保留。
- [x] Targeted GREEN：首次 `exit 0 / 0.440s`；加入历史 freeze isolation 后最终 `exit 0 / 0.382s`，fixed-base 三个 anchor 唯一，ordinary-drift assertion retained。
- [x] 首次实现后 focused `exit 1 / 0.996s / case 5`，仅因历史 source freeze 尚未隔离授权 projection block；最小修正只在 `Test-P1ApprovedSameTaskTransition.Smoke.ps1` 增加与 pre-commit 同构的 baseline normalization。
- [x] Fresh focused GREEN：`exit 0 / 163.653s / 950 cases / 5 markers`，满足 `<=180s`。
- [x] 双 PowerShell parser 对两份 smoke 均 0 errors；`git diff --check` exit 0；冻结 scope 仍为 18；相关进程/root 为 0。行为修正仅涉及两份 smoke，guard/Common/schema 未改。
- [ ] Module pre-push full 继续标记 `stale/RED`；production review 保持 `PENDING`，candidate identity/freshness 在 docs/fixture 变化后同样 stale。主线程对抗复核与重新冻结前不得重跑 full 或进入后续门禁。

### C6 Module Pre-push Fixture Main-thread Adversarial Review and Strict Freeze

- [x] 主线程复核 fixed-base projection：current candidate copy 明确排除 state/queue；state/queue 只从 `0fe8...` 读取并对 waiting→satisfied 与 `4f63...`→`0fe8...` 做唯一精确替换；anchor 不唯一即 fail closed。
- [x] 主线程复核 ordinary SHA drift 仍由原有标准模式断言 hard-block；transition-only、错误上下文、额外文件、拓扑与 replay 负例未被删除；未改生产 guard、Common 或 schema。
- [x] 双 PowerShell parser `0 errors`、`git diff --check`、精确 scope `18/18`、name-status A/M、相关进程与 disposable root `0/0` 均通过；focused 最终 `exit 0 / 163.653s / 950 cases / 5 markers` 保持在 `<=180s`。
- [x] docs-only strict freeze 两次独立解析均 `ParserValid=True`，唯一 finding 为 `P1_AST_EVIDENCE_REVIEW_PENDING`；canonical machine block 记录稳定 identity/freshness、`fixtureSha256=0760d9c7cda1909f85e6e510e35fd06259ec09f3a705342f7d73795eb81fbaed`、`commandCount=44`、`fileCount=18`，machine `reviewDecision=PENDING` 未自授权。
- [x] 本次 smoke/docs 变化使此前 P1 full、Module pre-commit full 与 Module pre-push full 结果 stale；不得复用。主线程复核通过后唯一下一入口是按代码冻结顺序重新串行运行 P1 full，再运行 Module pre-commit full、Module pre-push full；任一 RED 立即停下并回到同一实施者。

### C6 final serial P1 full PASS

- [x] final frozen P1 full：`exit 0 / 656.073s / 15 positive / 81 negative`；ordinary SHA drift and transition negative cases remain hard-blocked as expected.
- [x] serial/process disposition：no related runner remained; five same-prefix TEMP roots predated this run and were not created by it, so they are not fresh residue. No concurrent Module full ran.
- [ ] 唯一下一入口：串行运行 Module pre-commit full；其余 full、独立 reviewer 与 C7 仍等待顺序门禁。

### C6 final serial Module pre-commit full PASS

- [x] final Module pre-commit full：`exit 0 / 892.280s`；F-0117 与 Module Run v2 pre-commit smoke 均通过。
- [x] serial/process disposition：无相关运行进程；两个 matching TEMP roots 均为 2026-07-18 旧根，不是本次新鲜残留。
- [ ] 唯一下一入口：串行运行 Module pre-push full；其余 post-full gates、独立 reviewer 与 C7 仍等待。

### C6 final serial Module pre-push full PASS

- [x] final Module pre-push full：`exit 0 / 710.119s`；三项 pre-push/readiness smoke 均通过。
- [x] serial/process disposition：无相关进程、无本次新鲜 `tf143sp-*` 根目录；三套 final full 均通过。
- [ ] 下一入口：执行既有 post-full P1 manual、P0 baseline、Module readiness、format/diff、严格 scope/secret/evidence 检查；完成后才可启动独立最终 reviewer。

### C6 post-full P1 manual RED

- [x] P1 manual command exited `1 / 3.967s` with five legacy scope-freeze review-control findings and `P1_PROGRAM_TRANSITION_CONTROL_FILES_MISSING`.
- [x] Safety disposition：manual phase does not recognize the findingless mechanism bootstrap candidate; no bypass, guard weakening or synthetic evidence was used. Three final full smoke gates remain GREEN.
- [ ] Stop at the first post-full RED. P0, Module post-full guards, format/diff, independent reviewer and C7 are not authorized until this blocker is resolved under an explicit scoped decision.

### C6 manual mechanism-bootstrap compatibility correction

- Scope: same frozen 18 files only; production change may touch only `Test-P1RemediationSerialProgram.ps1`, with focused regression in `Test-P1ApprovedSameTaskTransition.Smoke.ps1` and corresponding evidence/audit/plan updates.
- Contract: manual mode may recognize only the exact approved findingless mechanism bootstrap task (`taskKind=mechanism_hardening`, `findingIds=[]`, `productClosureContribution=none`, exact parent/base/branch/authorization and exact current A/M file set). It must not recognize ordinary product transitions or historical finding-specific routes.
- Safety invariants: ordinary in-progress SHA drift, standard ancestor policy, wrong task/parent/base/branch/projection/files/status/topology/replay, missing external review and all existing P1/Module/P0 hard-blocks remain fail-closed. No hook bypass, database/provider/runtime/P2/PR/force-push/deploy scope.
- RED first: focused source-shape regression must fail because manual mechanism recognition is absent; no full or post-full command runs before targeted GREEN, fresh focused GREEN, main-thread adversarial review and strict evidence refresh.
- Stop: if manual support requires weakening a legacy contract, widening the file set, inventing review evidence or changing a stage-specific hard-block, stop and report that single blocker.
- [x] RED retained: focused exited `1 / 1.587s / case 281` because the exact `C6-MANUAL-MECHANISM-BOOTSTRAP` block was absent.
- [x] Minimal implementation: manual recognition is limited to the exact current task, fixed base/branch/parent, canonical state/queue/auth/evidence/audit and exact worktree A/M name-status. `??` maps to `A`; only one-sided uppercase `A`/`M` is accepted; mixed/deleted/renamed/copied/unknown states fail closed. F-0143 and every pre-commit/pre-push route remain unchanged.
- [x] Targeted chronology: the first runtime attempt exited `1 / 3.233s` because Windows PowerShell promoted expected missing-path `cat-file -e` stderr; per-path classification was replaced with stderr-free `ls-tree --name-only`. The final manual targeted command exited `0 / 9.586s` with `pass / standard`.
- [x] Fresh focused GREEN: `exit 0 / 167.1s / 959 cases / five markers`; no full command was rerun.
- [x] Main-thread correction review: actual source keeps `cat-file -e` only for fixed-base commit existence, uses `ls-tree --name-only` for A/M classification, restores the F-0143 `$LASTEXITCODE` line, and grants manual no ancestor or transition-only relaxation. Production review remains `PENDING`; this is not independent final approval or C7 authorization.

### C6 post-correction serial P1 full PASS

- [x] Fresh serial P1 full: `exit 0 / 671.3s / 15 positive / 81 negative`; the manual compatibility correction and all retained ordinary drift, topology, replay and transition hard-block cases passed.
- [x] No Module full ran concurrently; this closes only the first post-correction full gate. Module pre-commit is the sole next full command; production review remains `PENDING`.
- [ ] Independent final review, remaining post-full gates and C7 remain pending; no commit, merge or push is authorized by this entry.

### C6 post-correction serial Module pre-commit full PASS

- [x] Fresh Module pre-commit full: `exit 0 / 864.8s`; F-0117 P1/Module behavior and Module Run v2 pre-commit hardening passed.
- [x] Serial ordering held after P1 full; Module pre-push is the sole next full command. Production review remains `PENDING`.
- [ ] Post-full gates, independent final review and C7 remain pending; no Git closeout action ran.

### C6 Module closeout readiness RED and docs-only correction

- [x] First post-full Module closeout readiness exited `1 / 3.3s` with only `HARD_BLOCK_MISSING_THREAD_ROLLOVER_DECISION` and `HARD_BLOCK_MISSING_NEXT_MODULE_RUN_CANDIDATE`.
- [x] Root cause: the current evidence recorded the Module v2 anchors but not the required explicit rollover decision and next-run candidate fields. No production guard or permission change is involved.
- [x] Minimal docs-only correction records that no thread rollover or next Module Run starts before mechanism C7 closeout, while preserving the current task as the sole WIP=1 task. The corrected readiness command is the next post-full gate.

### C6 post-full gates GREEN

- [x] P1 manual: `exit 0 / 8.6s`; exact mechanism bootstrap recognized in `standard` manual mode with no ancestor relaxation.
- [x] P0 baseline: `exit 0 / 1.1s`; `p0GlobalBaselineResult: pass`, `dependencyCycleCount: 0`.
- [x] Module pre-commit manual: `exit 0 / 3.3s`.
- [x] Module closeout readiness: first docs-contract RED `1 / 3.3s` retained; corrected rerun `exit 0 / 1.0s`.
- [x] Module pre-push readiness with `-SkipRemoteAheadCheck`: `exit 0 / 3.4s`; local/master/origin/state checkpoints equal.
- [x] Format and diff: `npm.cmd run format:check` and `git diff --check` pass after formatting only the task plan.
- [ ] Strict machine evidence refresh, independent final review and C7 remain pending.

### C6 post-review-correction serial P1 full PASS

- [x] After the findingless predicate correction, fresh P1 full exited `0 / 717.7s / 15 positive / 81 negative`.
- [x] This result supersedes prior P1 full freshness for the changed guard; Module pre-commit is the sole next full command.
- [ ] Remaining Module full, post-full gates, strict refresh and C7 remain pending.

### C6 post-review-correction serial Module pre-commit full PASS

- [x] Fresh Module pre-commit full exited `0 / 915.9s`; F-0117 P1/Module behavior and Module Run v2 pre-commit hardening passed after the predicate correction.
- [ ] Module pre-push is the sole next full command; post-full gates, strict refresh and C7 remain pending.

### C6 post-review-correction serial Module pre-push full PASS

- [x] Fresh Module pre-push full exited `0 / 709.2s`; F-0117 scope-correction/scope-closeout and Module Run v2 pre-push readiness passed.
- [ ] Post-full gates, strict refresh, independent final review and C7 remain pending.

### C6 post-review-correction post-full gates GREEN

- [x] P1 manual: `exit 0 / 7.0s`; P0 baseline: `exit 0 / 1.1s` with 35 findings and 0 dependency cycles.
- [x] Module pre-commit manual: `exit 0 / 2.7s`; Module closeout readiness: `exit 0 / 1.1s`; Module pre-push readiness: `exit 0 / 3.8s`.
- [x] Format/diff: `npm.cmd run format:check` `exit 0 / 111907ms`; `git diff --check` `exit 0 / 135ms`.
- [ ] Final strict machine refresh and C7 remain pending.

### C6 post-exact-findingIds serial P1 full PASS

- [x] After requiring literal `findingIds: []` at all three findingless gates, P1 full exited `0 / 610.7s / 15 positive / 81 negative`.
- [ ] Module full, post-full gates, final strict refresh and C7 remain pending.

### C6 post-exact-findingIds serial Module pre-commit full PASS

- [x] Module pre-commit full exited `0 / 791.1s` after the exact scalar findingIds checks.
- [ ] Module pre-push is the sole next full command; post-full gates and C7 remain pending.

### C6 post-exact-findingIds serial Module pre-push full PASS

- [x] Module pre-push full exited `0 / 647.7s` after exact scalar findingIds checks; F-0117 scope and Module Run v2 readiness passed.
- [ ] Post-full gates, final strict refresh, independent review and C7 remain pending.

### C6 independent final review PASS

- [x] The single independent final reviewer returned `Critical=0`, `Important=0`, `Minor=0`; no guard, authorization, topology, ordinary-drift or evidence-boundary issue remains.
- [x] Reviewer confirmed all three findingless paths require literal `findingIds: []` plus parsed count zero, stale strict histories are marked, and current machine block is 18 files/85 commands with only `P1_AST_EVIDENCE_REVIEW_PENDING`.
- [ ] Final docs-only strict refresh and C7 closeout remain pending; mechanism closeout is not product completion.

### C6 post-exact-findingIds post-full gates GREEN

- [x] P1 manual `exit 0 / 7.0s`; P0 baseline `exit 0 / 1.1s`; Module pre-commit manual `exit 0 / 3.2s`; Module closeout `exit 0 / 1.1s`; Module pre-push readiness `exit 0 / 3.8s`.
- [x] Full-format/diff remains covered by the final post-review format result; no unrelated file appeared.
- [ ] Final strict refresh, independent re-review and C7 remain pending.

### Independent final review findings correction

- Standards re-read before implementation: `docs/03-standards/code-taste-ten-commandments.md`, ADR-001 through ADR-007, current project state and task queue; the correction remains inside the frozen 18-file governance scope and introduces no dependency, schema, runtime, Provider or remote action.
- Root cause: the findingless mechanism-bootstrap exemption derives `$taskFindingIds` but approves the task from only `taskKind` and `productClosureContribution`; a non-empty finding set can therefore enter the exempt path. The required invariant is explicit emptiness at the approval predicate, not an inference from later validation.
- TDD order: first extend the focused source-shape contract with the exact `$taskFindingIds.Count -eq 0` negative-boundary marker and retain its attributable RED; then add only that conjunct to `isApprovedFindinglessMechanismBootstrapTask`, run a targeted source-shape GREEN and one fresh focused GREEN. No full command is allowed.
- Docs correction: mark the historical C5 production `APPROVE` as stale/superseded and keep the current external production review at `PENDING`; this is not an independent final approval.
- Machine refresh: after code/docs freeze, recompute all bound adapter/fixture hashes, candidate identity and freshness from the current exact 18-file facts; strict-parse twice and require only `P1_AST_EVIDENCE_REVIEW_PENDING` with stable output.
- Risk defense: no other guard predicate, stage-specific hard-block, authorization, file set, topology, replay, ordinary drift or ancestor rule may change. Any unexpected focused finding stops the correction.
- [x] Focused RED retained: `exit 1 / 1.787s / case 291`, with the sole failure that the findingless approval predicate did not require an empty `findingIds` list.
- [x] Minimal production correction: add only `-and $taskFindingIds.Count -eq 0` to `isApprovedFindinglessMechanismBootstrapTask`.
- [x] Targeted GREEN: `exit 0 / 0.8s`, one predicate, one empty-list conjunct, zero parser errors, negative marker retained.
- [x] Fresh focused GREEN: `exit 0 / 175.6s / 961 cases / five markers`; no full command ran.
- [x] Historical C5 `APPROVE` is explicitly stale/superseded; current production review remains `PENDING`.
- [x] Historical pre-full strict dual parse: both reads returned only `P1_AST_EVIDENCE_REVIEW_PENDING`, with exact 18 files, 62 commands and `Stable=True`; this is stale/superseded by the later full/post-full additions and missing-key correction.
- [ ] Main-thread re-review remains required before any C7 action.

### Missing findingIds key fail-closed correction

- Root cause: `Get-ListValues` normalizes both a missing `findingIds` key and explicit `findingIds: []` to an empty array; count-only checks therefore cannot prove that the authorized findingless representation is present.
- Required invariant: all three findingless mechanism entry checks—the materialized-task exemption, manual context, and anchor validation—must require both zero parsed items and exact scalar `findingIds: []`.
- TDD order: add a reusable bootstrap mutation that removes only the exact `findingIds: []` line, add it to the focused negative matrix, and add source-shape assertions for all three exact scalar checks; retain the attributable focused RED before changing production.
- Minimal implementation: add only exact `Get-ScalarValue ... -Key "findingIds" -ceq "[]"` conjuncts. No other task, authorization, drift, ancestor, topology, replay, stage or file-set condition may change.
- Validation order: targeted parser/source contract, one fresh focused run, main-thread review, then docs/machine strict refresh. Full remains prohibited before main-thread review.
- [x] Focused RED: `exit 1 / 1.593s / case 292`, exact missing-key scalar boundary absent.
- [x] Minimal production correction: exact scalar `findingIds: []` required in materialized, manual and anchor entry checks; parsed count-zero checks retained.
- [x] Targeted GREEN: `exit 0 / 0.7s`; three exact scalar checks and missing-key mutation/negative markers present.
- [x] Fresh focused GREEN: `exit 0 / 168.349s / 968 cases / five markers`; no full ran.
- [x] Commands 63-72 and the 62-command strict result are marked stale for this changed candidate.
- [x] Historical 75-command strict dual parse: exact 18 files, only `P1_AST_EVIDENCE_REVIEW_PENDING`, `Stable=True`; stale/superseded by commands 76-85.
- [x] Final current 85-command strict dual parse: exact 18 files, only `P1_AST_EVIDENCE_REVIEW_PENDING`, `Stable=True`; docs-only only, no full/production/Git action.
- [ ] Main-thread review remains required before any full or C7 action.

以下条款与用户 v2.1 章程同等约束，不得被任务分解、实现便利或后续摘要覆盖：

1. 当前 P1 Goal 不结束、不替换、不重建、不标记 blocked；机制任务是安全停靠点插入。
2. task plan/checkpoint 表之前无 parser/guard/smoke/state/queue/product 修改；聊天、摘要和 Subagent prompt 不替代本计划。
3. checkpoint 严格顺序；每次进入前重读本计划并持久化 candidate/base/files/freshness/commands/durations/counts/budget/stale/retry/risk/next entry。
4. freshness key 仅确定性计算和证据标识；无缓存服务、数据库、daemon、scheduler 或平台。
5. 后续三个产品任务本次只交模板/公式/入口，不伪造结果、不作为本次等待条件。
6. Subagent 只接收当前 checkpoint；最多一实施者和一 final reviewer；修正回原实施者。
7. 保留历史 hardcode/codes/negatives；本次不迁移、删除、归档。
8. characterization 先于通用 RED，RED 先于 production GREEN。
9. 合同严格版本化、PowerShell 5.1 安全、raw-first、宽识别严验证、不可自授权、A/M-only、ordinal exact files、fail-closed topology。
10. 唯一 shared validator 返回 normalized decision；三个 adapter 薄且保留阶段专属 hard-block。
11. machine evidence 与人类文本解耦；真实命令、exit code、duration、counts 和受影响 identity 先于结论。
12. focused/contract-only/full/docs-only 分层；full 在代码冻结后串行一次；stale 后只补受影响 profile；focused 不替代真实 closeout 门禁。
13. ordinary drift、standard ancestor、wrong context/projection/file/status/topology/replay/self-auth/fallback 全部 hard-block。
14. C3 恢复窗口仍为 90 分钟 focused GREEN；等待、诊断、Subagent 协调均计入 mechanismOverhead；超过 `2026-07-19T09:33:58.1040109-07:00` 按唯一 stop condition 停止。
15. C7 必须 commit、ff-only、ordinary push、cleanup、metrics，并以恢复原 P1 Goal 为最后必做动作；未恢复不得宣布完成。

## Self-Review

- [x] Spec coverage：逐节对照用户章程零至十一，所有 MUST/MUST-NOT、profiles、预算、指标和恢复均有实现/验证入口。
- [x] Placeholder scan：无 `TBD`、`TODO`、`implement later`、未定路径或未定义接口。
- [x] Type/name consistency：合同 key、shared function、normalized decision、finding code、profile 和 evidence key 在所有任务中一致。
- [x] Scope check：Allowed Files 精确 18 项；Blocked Files/Actions 不被任何步骤隐式扩大。
- [x] First-principles check：授权、identity、projection、file status、topology、replay 和 evidence 分别有独立事实来源，任何一个缺失都不能由另一个推断。
