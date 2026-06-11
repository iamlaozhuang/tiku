# 2026-06-11 机制自动推进系统审计报告

## 结论摘要

当前推进机制已经具备比较完整的安全护栏、状态源、任务队列、证据、closeout、automation 注册、run registry、auto-seed proposal 和 seed self-review 能力。它不是“没有机制”，而是“护栏优先的半自动机制已经比较厚，但无人值守自动驾驶的执行闭环还没有真正打通”。

我的评价是：安全性强于效率，恢复能力强于自动续航，状态可追溯性强于状态简洁性。它适合防止越权、误推、误改、污染状态，但目前仍容易在可自动恢复或可自动拆解的地方停下，形成用户感知上的“自动驾驶断点”。

本次最典型的现场样本是：

- `currentTask` 已 `closed`；
- 队列没有 `pending`；
- runner 能识别下一模块 `ai-task-and-provider`，并提出四个低风险本地 implementation seed 候选任务；
- 但最终输出为 `runnerNextAction: request_auto_seed_approval`，且 `stopTaxonomy: hard_block`。
- `tiku-module-run-v2-mechanic-2` 仍作为 on-demand mechanic identity anchor 保留，用于机制修复范围识别。

这不是产品实现阻断，而是控制环分类、默认策略和审批复用没有对齐。

## 对用户六项困扰的审计判断

| 用户困扰                                 | 当前机制表现                                                                                    | 审计判断                                         | 优先级 |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------ |
| 自动推进经常在不必要处停下               | `no_executable_task` 后有 seed proposal，但显示为 `hard_block`                                  | 停止分类过粗，安全停与可继续动作混淆             | P0     |
| 过度谨慎导致效率低、token 浪费、状态噪声 | 每轮输出历史 evidence gap、blocked gates、legacy done、多个状态源                               | 守护信息有价值，但缺少分层摘要与噪声预算         | P1     |
| 停下时原因和下一步建议不清晰             | runner 输出 reason，但没有统一 `requiresHuman`、`nextCommand`、`safeToResume`                   | 缺少机器和人都能消费的 stop envelope             | P0     |
| 停下时收尾收口不足                       | 已有 run registry finalizer 能力，但需要作为所有终止路径的不变式                                | 收口能力已补强，仍需全路径强制化                 | P0     |
| 无任务时应自动拆解                       | 已有 `Get-ModuleRunV2ImplementationSeedProposal.ps1` 和 `New-ModuleRunV2ImplementationSeed.ps1` | 自动拆解能力存在，默认执行策略仍偏 proposal-only | P0     |
| 拆解需 MECE 复核                         | 已有 coverage SOP 和 seed self-review，但 self-review 更偏 task metadata 与 target closure      | 需要把 MECE 变成 seed 前置结构化门禁             | P1     |

## 架构视角评价

### 强项

1. **安全边界清楚**：依赖、env/secret、provider、schema migration、deploy、push、Cost Calibration Gate 都被显式阻断或审批化。
2. **任务状态可恢复**：`project-state.yaml`、`task-queue.yaml`、evidence、audit review、run registry、handoff 共同支撑跨会话恢复。
3. **自动拆解基础已经存在**：当前能从 domain module matrix 推导下一模块和候选 task，并具备 seed transaction 与 self-review。
4. **closeout 治理比普通项目严格**：本地 commit、fast-forward merge、push、cleanup 都被拆成可审查动作。
5. **注册可见性已经修复**：当前 canonical automation 为 `tiku-module-run-v2-autopilot`，旧 `tiku-module-run-v2-autopilot-2` 已暂停。

### 主要问题

1. **stop taxonomy 与行动语义混在一起**  
   `seed_proposal_available` 是“有下一步但需要审批/可套用审批”的状态，不应被默认归为 `hard_block`。`hard_block` 应只用于 unsafe 或 impossible。

2. **默认自动驾驶策略偏保守**  
   runner 支持 `-AllowAutoSeed` 和 `-AutoSeedApprovalStatement`，项目状态也有 standing approval，但当前默认唤醒没有消费这类 standing approval，导致“有机制但停在请求批准”。

3. **状态源多，但字段职责没有足够薄**  
   SOP、schema、matrix、project-state、task queue、script output 都在描述类似边界。它们不是错误，但需要明确“谁拥有事实，谁只是索引或派生摘要”。

4. **历史噪声仍进入当前决策视野**  
   `legacy_done=94`、`evidenceMissing=6` 作为诊断信息有用，但在自动推进摘要中反复出现，会消耗注意力和 token，并增加误判为 blocker 的风险。

5. **MECE 没有成为 auto-seed 的一等门禁**  
   现在 seed self-review 会检查 target closure coverage、metadata、安全文件范围和 validation，但还没有强制要求 `requirement -> capability -> user flow -> acceptance scenario -> task` 的不重不漏矩阵。

## P0 修复建议

### 1. 重构 stop envelope

为 runner、startup、next action、seed bridge 统一输出以下字段：

| 字段            | 含义                                                                      |
| --------------- | ------------------------------------------------------------------------- |
| `decision`      | 当前脚本自己的结果，如 `seed_proposal_available`                          |
| `severity`      | `idle`、`advisory`、`auto_recoverable`、`approval_required`、`hard_block` |
| `requiresHuman` | `true` 或 `false`                                                         |
| `safeToProceed` | 自动化是否能继续下一步                                                    |
| `nextCommand`   | 推荐执行的精确命令；无命令则写 `none`                                     |
| `stateWritten`  | 本轮是否写入状态；若没有，写 `none`                                       |
| `resumePointer` | 下一轮恢复应读取的文件或 task id                                          |

推荐映射：

| 当前场景                                         | 现状                                     | 应改为                                                                    |
| ------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------- |
| 无任务且无 seed candidate                        | `no_executable_task`                     | `severity: idle`                                                          |
| 无任务且有 seed proposal，缺审批                 | `seed_proposal_available` + `hard_block` | `severity: approval_required`                                             |
| 无任务且有 seed proposal，standing approval 可用 | `request_auto_seed_approval`             | `severity: auto_recoverable`，直接 seed 或输出可执行命令                  |
| clean stale artifact                             | cleanup path                             | `severity: auto_recoverable`                                              |
| active owner healthy                             | exit                                     | `severity: idle`                                                          |
| dirty unknown worktree                           | hard block                               | `severity: hard_block`                                                    |
| provider/env/schema/deploy 未批准                | hard block                               | `severity: approval_required` 或 `hard_block`，按是否可由明确审批解除区分 |

### 2. 让 runner 消费 standing auto-seed approval

当前 `project-state.yaml` 已有低风险本地 implementation 的 standing approval，runner 也具备参数能力。建议增加一个策略：

```text
when startupDecision == no_executable_task
and seedProposalDecision == proposal_available
and standingUnattendedLocalCloseoutApproval.status == approved
and seedRequiredApproval == autoDriveLocalImplementationApproval
and proposed tasks are low-risk local implementation tasks
then apply seed transaction with the durable approval statement
then run seed self-review
then stop at closeout_auto_seed_transaction or continue only when ContinueAfterAutoSeed is enabled
```

这会把“无任务等待人工重复批准”变成“自动生成下一批可领取任务，并在生成交易后做收口”。它仍不会直接执行高风险工作。

### 3. 所有终止路径强制 finalizer 或显式 no-write

每次 runner 终止，无论是 idle、approval_required、auto_recoverable 失败、human handoff 还是 hard block，都必须满足：

- 写 run registry finalizer；或
- 输出 `stateWritten: none` 加 `noWriteReason`，说明为什么本轮不需要 durable terminal record。

finalizer 至少包含：

- `taskId`
- `runnerDecision`
- `severity`
- `stopCause`
- `nextRecommendedAction`
- `nextCommand`
- `safeToResume`
- `safeToAdopt`
- `stateFilesTouched`
- `evidencePath`
- `auditReviewPath`

### 4. 停下时输出人类可读的三行结论

每次停止必须有这三行，避免用户需要读长日志：

```text
Why stopped: <一句话说明真实原因>
Risk if auto-continued: <没有风险则写 none>
Next action: <精确命令或等待哪类批准>
```

当前样本应输出类似：

```text
Why stopped: queue has no pending task and ai-task-and-provider seed proposal is available.
Risk if auto-continued: none for proposal; queue mutation requires autoDriveLocalImplementationApproval.
Next action: run auto-seed with standing approval, then seed self-review and closeout seed transaction.
```

## P1 优化建议

### 5. 引入验证与证据分层

不要每个低风险任务都跑同等重的门禁。建议按任务风险选择证据 profile：

| Profile                   | 适用场景                               | 最小验证                                        |
| ------------------------- | -------------------------------------- | ----------------------------------------------- |
| `L0-docs`                 | 只读审计、机制说明、计划               | `git diff --check`、targeted phrase check       |
| `L1-mechanism`            | 机制脚本/SOP 修改                      | 对应 smoke、`git diff --check`、targeted check  |
| `L2-local-implementation` | 低风险本地实现                         | lint、typecheck、focused test、module readiness |
| `L3-high-risk`            | schema/env/provider/deploy/destructive | 明确人工批准、专门 evidence、回滚或恢复说明     |

这样能降低 token 和运行成本，同时保留风险相称的证据。

### 6. 状态源瘦身

建议建立字段所有权表：

| 事实                     | 唯一写入源                                       | 其他文件角色        |
| ------------------------ | ------------------------------------------------ | ------------------- |
| 当前 task 指针           | `project-state.yaml`                             | SOP 只解释，不复制  |
| task 状态和 allowedFiles | `task-queue.yaml`                                | evidence/audit 引用 |
| 模块目标 closure         | `advanced-edition-domain-module-run-matrix.yaml` | seed proposal 派生  |
| automation 注册身份      | `project-state.yaml` + Codex automation registry | schema/SOP 只校验   |
| transient run ownership  | run lease / run registry                         | repo 文档不复制     |
| validation 事实          | evidence file                                    | queue 只存路径      |

目标是减少“同一事实在多处记录后漂移”。

### 7. 把 MECE 变成 seed self-review 的硬门禁

auto-seed 前，新增或增强 MECE 复核，至少检查：

1. **Mutually Exclusive**：候选任务的 `allowedFiles`、目标 closure、验收场景不能重叠到会互相改同一业务行为。
2. **Collectively Exhaustive**：模块 `targetLocalClosure` 的每一项都有候选任务或 explicit blocked remainder。
3. **Requirement Traceability**：每个候选任务至少引用一个 requirement/source planning task 和一个 acceptance scenario。
4. **Non-goal Clarity**：每个任务列出不做的高风险边界，如 provider/env/schema/deploy。
5. **Flow Coverage**：成功、空态、错误、权限、边界场景至少被覆盖或说明不适用。
6. **Validation Fit**：每个 acceptance scenario 有对应验证命令或明确 blocked reason。

建议将 seed candidate 从“目标 closure 文本”升级成结构化对象：

```yaml
targetClosureItem:
requirementRefs:
userRoles:
acceptanceScenarios:
nonGoals:
blockedRemainder:
validationProfile:
```

### 8. 降低历史噪声默认曝光

`legacy_done`、旧 evidence gap、长期 blocked gates 只在摘要中输出数量；只有在影响当前任务时展开明细。建议：

- 默认：`historicalNoise: evidenceMissing=6; notBlockingCurrentRun=true`
- 详细：加 `-VerboseHistory` 才输出 first ids。

## P2 机制成熟度建议

### 9. 增加“断点经济性”指标

无人值守机制需要指标驱动，否则会越修越复杂。建议记录：

- false stop rate：非 unsafe 场景导致停止的比例；
- mean unattended steps：平均连续自动推进步数；
- token per closed task：每关闭一个任务的近似 token 成本；
- state drift count：每轮发现的真实状态漂移数；
- approval reuse rate：standing approval 被正确复用的比例；
- handoff completeness rate：停止时三行结论和 next command 是否完整。

### 10. 增加“停后恢复剧本”

每类停止都应有固定恢复剧本：

| Severity            | 恢复策略                                     |
| ------------------- | -------------------------------------------- |
| `idle`              | 退出，不创建新线程，不重试                   |
| `advisory`          | 继续，但 evidence 记录                       |
| `auto_recoverable`  | 自动执行 bounded repair，然后 rerun startup  |
| `approval_required` | 输出批准文本、风险、精确命令                 |
| `hard_block`        | 停止，写 finalizer/handoff，禁止自动扩大范围 |

## 建议拆成的后续任务

| 顺序 | 任务                                       | 目标                                                               | 验收                                                                 |
| ---- | ------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| 1    | `mechanism-stop-envelope-normalization`    | 统一 runner/startup/seed 输出 severity、nextCommand、requiresHuman | smoke 覆盖 seed proposal 不再显示 hard_block                         |
| 2    | `mechanism-standing-auto-seed-consumption` | runner 在 standing approval 满足时自动 apply seed transaction      | no pending + seed proposal 场景自动生成 pending tasks 并 self-review |
| 3    | `mechanism-terminal-finalizer-contract`    | 所有 runner terminal path 写 finalizer 或 no-write reason          | smoke 覆盖 idle、approval_required、hard_block、auto_recoverable     |
| 4    | `mechanism-seed-mece-self-review`          | seed self-review 增加 MECE 与 requirement/acceptance traceability  | 缺 requirement 或重叠 closure 时 hard-block                          |
| 5    | `mechanism-state-source-slimming`          | 建字段所有权表并减少重复状态输出                                   | SOP/schema/index 与脚本输出一致                                      |
| 6    | `mechanism-diagnostic-noise-budget`        | 历史 legacy/evidence noise 默认折叠                                | 默认输出短摘要，verbose 才展开                                       |

## 对当前状态的直接建议

短期不需要手动重复创建 Codex automation；automation registration 已经 ready。

真正需要修的是当前 control loop 的“UI visibility 之后的续航能力”：

1. 把 `seed_proposal_available` 从 `hard_block` 分类里拿出来。
2. 让 runner 能读取并复用 `standingUnattendedLocalCloseoutApproval` 触发 `AllowAutoSeed`。
3. 让无任务时自动生成下一批低风险本地 implementation tasks，再由 self-review 和 closeout 保护边界。
4. 在任何停止时输出标准 stop envelope 和三行人类结论。

如果这四点完成，机制会从“安全的半自动推进”明显接近“可无人值守续航的自动驾驶”。

## 品味合规自检 Checklist

- 未修改业务代码、数据库、API、前端 UI 或依赖。
- 未引入硬编码颜色、间距、字体或 UI 魔法值。
- 未改动 API 响应结构、数据库命名或项目术语。
- 未执行 provider、env/secret、schema migration、deploy、push、PR 或 Cost Calibration Gate。
- 文档中继续使用项目既有术语：`authorization`、`paper`、`mock_exam`、`audit_log`、`ai_call_log`、`task-queue.yaml`、`project-state.yaml`。
- 审计建议保持证据先于结论，并明确区分 `approval_required`、`auto_recoverable` 与 `hard_block`。
- Cost Calibration Gate remains blocked.
