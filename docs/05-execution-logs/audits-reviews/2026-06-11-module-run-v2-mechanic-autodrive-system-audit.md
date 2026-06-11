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

## 二次深入审计发现

### 当前基线事实

| 维度          | 当前事实                                                                                                          | 审计判断                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Git 分支      | `codex/mechanism-serial-governance`                                                                               | 符合非 `master` / `main` 审计工作边界                         |
| 当前提交      | `07913e7c docs(mechanism): audit autodrive advancement governance`                                                | 上一轮机制审计已提交                                          |
| 工作区        | 二次审计开始前 `git status --short --branch` 为 clean                                                             | 本轮新增变更应只限 task plan、evidence、audit report          |
| Automation    | `tiku-module-run-v2-autopilot` 为 `ACTIVE`；旧 `tiku-module-run-v2-autopilot-2` 为 `PAUSED`                       | UI visibility / automation registration repair 当前有效       |
| Standing 审批 | `project-state.yaml` 存在 `standingUnattendedLocalCloseoutApproval.status: approved`                              | 审批事实存在，但 runner 默认参数缺失时不会自行读取并注入      |
| Queue 状态    | `currentTask: mechanism-runner-consumes-next-action(closed)`；`queueDecision: no_pending_task`                    | 当前不是业务实现阻断，而是无 pending 后的 control loop 决策点 |
| Runner 样本   | `seedProposalDecision: proposal_available`；`runnerDecision: seed_proposal_available`；`stopTaxonomy: hard_block` | 典型不必要断点：有可治理下一步，却被展示为硬阻断              |
| Hygiene       | `stoppedAutomationHygieneDecision: clean`；cleanup candidate/action/deferred 都为 0                               | 当前停顿不是 stale automation hygiene 问题                    |
| 高风险门禁    | `Cost Calibration Gate remains blocked`                                                                           | 高风险边界仍被正确阻断，本轮不建议放松                        |

### 六项困扰逐项复核

| 用户困扰               | 二次审计结论                                                                                                      | 证据                                                                                         | 严重度 | 建议修复方向                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| 不必要断点             | 成立。`seed_proposal_available` 是 approval / auto-seed 桥接状态，不是真正 `hard_block`。                         | `Get-RunnerStopTaxonomy` 未映射 `seed_proposal_available`，默认落入 `hard_block`。           | P0     | 建立独立 severity：`approval_required`、`auto_recoverable`、`idle`、`hard_block`，不要用 taxonomy 承载所有语义。 |
| 过度谨慎、效率低、噪声 | 部分成立。高风险 blocked gates 必须保留，但历史 `legacy_done=94`、`evidenceMissing=6` 默认展开会稀释当前信号。    | `Get-TikuNextAction.ps1` 每次输出 historical findings，即使 `stopReason: none`。             | P1     | 引入三层诊断：默认摘要、verbose 展开、hard-block 展开。                                                          |
| 停下原因和建议不清晰   | 成立。runner 有 `reason` 和 `runnerNextAction`，但没有统一 `requiresHuman`、`nextCommand`、`riskIfContinued`。    | `Write-RunnerResult` 输出 decision/action/taxonomy/reason，但没有 terminal envelope。        | P0     | 每次停止输出三行结论和机器可消费 stop envelope。                                                                 |
| 停下收尾收口不足       | 部分成立。finalizer 能写 durable terminal facts，但不是所有 terminal path 的强制不变式，也缺 no-write reason。    | finalizer 参数有 `StopTaxonomy`、`EvidencePath`、`NextRecommendedAction`，无 `nextCommand`。 | P0     | 所有终止路径强制 finalizer 或 `stateWritten: none` + `noWriteReason`。                                           |
| 无任务自动拆解         | 成立。proposal 和 seed transaction 能力存在，但默认 runner 仍停在请求审批，PlanOnly 样本仍显示 `hard_block`。     | runner 支持 `-AllowAutoSeed` / `-AutoSeedApprovalStatement`，但脚本默认不从 state 注入审批。 | P0     | 让 runner 读取 standing approval，满足低风险条件时自动 seed transaction 并 self-review。                         |
| MECE 拆解复核          | 成立。当前四个 target closure 方向上不重叠，但 seed self-review 不足以证明 requirement-to-acceptance 的不重不漏。 | self-review 更偏 metadata/scope/template/allowedFiles/validation lifecycle。                 | P1     | 把 `requirementRefs`、`userRoles`、`acceptanceScenarios`、`blockedRemainder`、`validationProfile` 纳入门禁。     |

### 不必要断点分类矩阵

| 场景                                                 | 当前表现                                      | 建议 severity                       | 是否需要人工 | 自动化下一步                                                                                |
| ---------------------------------------------------- | --------------------------------------------- | ----------------------------------- | ------------ | ------------------------------------------------------------------------------------------- |
| 无 pending，且无 seed candidate                      | `no_executable_task` / `idle_no_pending_task` | `idle`                              | 否           | 停止，写明 no-op；不创建新线程，不重试                                                      |
| 无 pending，有 seed proposal，无显式审批             | `seed_proposal_available` + `hard_block`      | `approval_required`                 | 是           | 输出可复制批准语句、风险边界、精确命令                                                      |
| 无 pending，有 seed proposal，standing approval 满足 | 仍可能请求 `request_auto_seed_approval`       | `auto_recoverable`                  | 否           | 自动传入 approval statement，apply seed transaction，self-review，closeout seed transaction |
| Stopped hygiene clean                                | `clean`                                       | `advisory`                          | 否           | 只记录摘要，不应阻断                                                                        |
| cleanup candidate clean/stale 可清理                 | `cleanup_available` / `hygiene_deferred`      | `auto_recoverable`                  | 否           | 执行 bounded hygiene cleanup；失败才升级                                                    |
| cleanup deferred 且原因安全                          | 可能被视为 stop                               | `advisory`                          | 否           | 输出 deferred reason，继续或 idle                                                           |
| cleanup deferred 且涉及脏 worktree/未合并分支        | hygiene stop                                  | `approval_required` 或 `hard_block` | 视风险       | 保留路径和原因，禁止手删；需要人工确认或专门 recovery                                       |
| healthy active owner / fresh lease                   | `exit_active_owner_present`                   | `idle`                              | 否           | 静默退出并说明 owner                                                                        |
| stale dirty owner                                    | `manual_required_owner_recovery`              | `approval_required`                 | 是           | 输出 recovery script 和风险，不自动接管                                                     |
| closeout recovery 可执行                             | `closeout_recovery`                           | `auto_recoverable`                  | 否           | 走 dispatcher + closeout recovery script                                                    |
| closeout recovery 信息不足                           | 可能变成 generic block                        | `approval_required`                 | 是           | 写 finalizer/handoff，给出缺失字段                                                          |
| dirty unknown worktree                               | `stop_for_hard_block`                         | `hard_block`                        | 是           | 停止，不自动修复                                                                            |
| provider/env/schema/deploy/Cost Calibration Gate     | blocked gates                                 | `approval_required` 或 `hard_block` | 是           | 继续阻断；Cost Calibration Gate remains blocked                                             |

### 状态噪声与漂移来源表

| 信息类别                      | 唯一事实源                                                   | 派生摘要 / 展示源                      | 默认展示建议              | 展开条件                                                   |
| ----------------------------- | ------------------------------------------------------------ | -------------------------------------- | ------------------------- | ---------------------------------------------------------- |
| 当前 task 指针                | `docs/04-agent-system/state/project-state.yaml`              | `Get-TikuNextAction.ps1`               | 展示当前 task 一行        | 当前 task 非 closed 或状态异常                             |
| task status / allowedFiles    | `docs/04-agent-system/state/task-queue.yaml`                 | readiness、dispatcher、evidence        | 只展示 next task          | claim/continue/closeout 相关                               |
| 模块目标 closure              | `advanced-edition-domain-module-run-matrix.yaml`             | seed proposal                          | 展示模块和候选数          | auto-seed、MECE self-review                                |
| Standing approval             | `project-state.yaml` + automation prompt                     | runner 参数                            | 展示 status 和 scope      | 需要消费审批或审批不匹配                                   |
| Automation 注册状态           | `$HOME\.codex\automations\*/automation.toml` + project-state | startup readiness / registration check | 展示 active id            | active count 不为 1、id 漂移、UI 不可见                    |
| 历史 `legacy_done`            | `task-queue.yaml`                                            | `Get-TikuNextAction.ps1`               | 默认只展示计数            | `-VerboseHistory` 或影响当前 closeout                      |
| 历史 `evidenceMissing`        | `task-queue.yaml` + evidence files                           | `Get-TikuNextAction.ps1`               | 默认只展示计数            | 当前 task evidence 缺失或 release gate 需要                |
| 高风险 blocked gates          | capability gate SOP / schema                                 | `Get-TikuNextAction.ps1`               | 默认按类别压缩            | 当前任务触及 dependency/env/provider/schema/deploy/push 等 |
| transient owner / lease / run | run lease、run registry、handoff                             | startup readiness、finalizer           | 展示 owner 和 fresh/stale | owner 非健康、需要 recovery/adopt/cleanup                  |
| validation 事实               | evidence file                                                | audit report / queue pointer           | 展示 pass/fail 摘要       | 任务完成、失败、closeout、回归风险                         |

建议模型：

| 层级            | 输出内容                                                                        | 目标                          |
| --------------- | ------------------------------------------------------------------------------- | ----------------------------- |
| 默认摘要        | 当前 task、queue decision、runner decision、severity、nextCommand、历史噪声计数 | 降低 token 和误判成本         |
| verbose 展开    | historical ids、blocked gate 明细、seed candidate 明细、drift first items       | 人工审计或机制调试            |
| hard-block 展开 | 全量 blocker、受影响文件、风险、恢复命令、state write 结果、handoff 指针        | 真正 unsafe / impossible 场景 |

### 停下收口覆盖矩阵

| Terminal path                              | 当前 durable 记录能力                       | 缺口                                                          | 建议不变式                                                                 |
| ------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `seed_proposal_available`                  | runner 输出 decision/action/reason/taxonomy | 没有 `nextCommand`；没有说明 standing approval 是否可自动消费 | `approval_required` 或 `auto_recoverable`，输出批准语句或自动 seed 命令    |
| `no_executable_task` 且无 candidate        | runner 输出 idle action                     | 没有 `stateWritten: none` / `noWriteReason`                   | idle 也输出 no-op terminal envelope                                        |
| `cleanup_available` / `cleanup_deferred`   | startup / hygiene 输出 candidate/action     | deferred 原因没有统一 risk / nextCommand                      | bounded cleanup 成功自动恢复；deferred 必须写 risk 和恢复路径              |
| `exit_active_owner_present`                | runner 输出 leave owner                     | 缺 owner id / freshness / resume pointer 的统一字段           | idle envelope 记录 owner 与“不接管”原因                                    |
| `manual_required_owner_recovery`           | runner 输出 approval/recovery request       | finalizer/handoff 是否写入依路径而定                          | 必须 finalizer 或 handoff，附 recovery script 和需要人工确认的原因         |
| `closeout_recovery`                        | runner 能输出 recovery action               | 不保证所有路径都有 finalizer，也缺三行人类结论                | dispatcher 前后都保留 `nextCommand`、`stateFilesTouched`、`resumePointer`  |
| `stop_for_hard_block`                      | runner 输出 taxonomy/reason                 | `hard_block` 过载；可能包含 approval 或可恢复场景             | 只有 unsafe/impossible 才 hard block；其他拆到 approval/auto/idle/advisory |
| `seed_transaction_applied`                 | runner 输出 closeout action                 | seed transaction closeout 与后续 claim 的边界需要更显式       | 必须先 closeout seed transaction；禁止同一脏 worktree 直接领取 seeded task |
| validation failure                         | finalizer 支持 evidence/audit path          | 缺标准 `riskIfContinued` 和 `nextCommand`                     | failure envelope 指向 exact validation command 和 evidence                 |
| iteration limit reached / unknown decision | generic reason                              | 没有分类为 runner defect / config defect / transient          | 写 hard-block finalizer，附脚本名、step、unknown decision、复现命令        |

建议每次停止固定输出：

```text
Why stopped: <真实停止原因>
Risk if auto-continued: <风险；没有则写 none>
Next action: <精确命令、审批文本或 none>
```

同时，机器字段至少包含：

```yaml
severity:
requiresHuman:
safeToProceed:
nextCommand:
stateWritten:
noWriteReason:
resumePointer:
```

### 自动拆解与 MECE 审计

| 审计项                        | 当前能力                                                                                                    | 缺口                                                                                             | 建议补强                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 下一模块识别                  | seed proposal 能选中 `ai-task-and-provider`                                                                 | 无 pending 时 runner 默认仍可能停在 approval request                                             | standing approval 满足时自动进入 seed transaction                               |
| 候选任务生成                  | 基于四个 `targetLocalClosure` 生成 batch-105 至 batch-108                                                   | 候选任务名称和 closure 有，但 requirement/use case/acceptance traceability 不完整                | seed candidate 升级为结构化对象                                                 |
| Standing approval 消费        | runner 支持参数；ACTIVE automation prompt 已带 `-AllowAutoSeed` 和 approval statement                       | runner 脚本默认不读取 `project-state.yaml` 注入 standing approval；PlanOnly 仍报 `hard_block`    | runner 增加 state-driven approval resolver                                      |
| Seed transaction 安全边界     | `New-ModuleRunV2ImplementationSeed.ps1` 写 allowed/blocked files、approval anchors、validation lifecycle    | 没有证明四个任务覆盖完整用户流程，也没有显式 blocked remainder                                   | seed 前做 MECE gate，失败则不写队列                                             |
| Self-review                   | 检查 metadata、scope、template、approval anchors、allowed/blocked files、validation lifecycle               | 不检查 requirement source -> user role/use case -> acceptance scenario -> validation evidence 链 | 增加 requirement/task coverage SOP 的强制校验                                   |
| `ai-task-and-provider` 不重叠 | 四个 target closure 分别覆盖 lifecycle contract、request/result reference、audit evidence、sandbox proposal | 方向上不重叠，但文件范围和业务行为边界仍需 seed 时结构化声明                                     | 每个 candidate 声明 `nonGoals` 和与其他 candidates 的边界                       |
| `ai-task-and-provider` 不遗漏 | 四个 target closure 均有候选任务                                                                            | 未证明源规划任务、用户角色、失败路径、权限路径、空态和验收证据全部覆盖                           | 每个 target closure 必须有 candidate 或 `blockedRemainder`                      |
| 可追溯                        | matrix 能追到 source module `ai-task-domain`                                                                | 不能直接追到 requirement/source planning task、acceptance scenario、validation evidence          | 增加 `requirementRefs`、`userRoles`、`acceptanceScenarios`、`validationProfile` |

建议 seed candidate 结构：

```yaml
targetClosureItem:
requirementRefs:
userRoles:
useCases:
acceptanceScenarios:
nonGoals:
blockedRemainder:
allowedFiles:
blockedFiles:
validationProfile:
validationEvidencePlan:
```

### 更新后的修复 backlog

| 优先级 | 任务                                       | 目标                                                                                   | 验收口径                                                                                              |
| ------ | ------------------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| P0     | `mechanism-stop-envelope-normalization`    | 统一 runner/startup/seed/dispatcher 的 severity、requiresHuman、nextCommand            | `seed_proposal_available` 不再显示为 `hard_block`；真实 hard block 仍阻断                             |
| P0     | `mechanism-standing-auto-seed-consumption` | runner 在 standing approval 满足时自动消费 `standingUnattendedLocalCloseoutApproval`   | 无 pending + proposal available 场景自动 seed transaction + self-review；不触发高风险门禁             |
| P0     | `mechanism-terminal-finalizer-contract`    | 所有 terminal path finalizer 或 no-write reason 化                                     | idle、approval_required、auto_recoverable、hard_block 都有三行结论和 `stateWritten` / `noWriteReason` |
| P1     | `mechanism-seed-mece-self-review`          | seed self-review 强制 MECE 与 requirement/acceptance traceability                      | 缺 requirement refs、acceptance scenarios、blocked remainder 或任务重叠时拒绝 seed                    |
| P1     | `mechanism-diagnostic-noise-budget`        | 历史 `legacy_done`、`evidenceMissing`、长期 blocked gates 默认折叠                     | 默认输出只保留计数和 notBlockingCurrentRun；verbose 才展开 ids                                        |
| P1     | `mechanism-state-source-ownership-map`     | 建立字段所有权表，减少 SOP/schema/state/script 重复记录                                | 每类事实只有一个写入源，其他文件只引用或派生                                                          |
| P2     | `mechanism-stop-economics-metrics`         | 记录 false stop rate、mean unattended steps、approval reuse rate、handoff completeness | 后续机制修复有量化目标，而不是继续靠主观体感                                                          |

### 本轮非修复声明

本次二次审计没有实施上述 backlog，也没有修改 runner 行为、SOP/schema、`task-queue.yaml`、seed transaction、provider/env/schema/deploy/push 相关能力。报告结论只作为后续机制修复方案的输入。

Cost Calibration Gate remains blocked.
