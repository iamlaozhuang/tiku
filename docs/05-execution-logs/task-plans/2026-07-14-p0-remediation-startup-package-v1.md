# P0 整改启动包 v1.0 执行计划

> **For agentic workers:** REQUIRED SUB-SKILL: 使用 `superpowers:executing-plans` 内联执行；未经用户批准禁止使用 Subagent。步骤使用 checkbox 跟踪。

**Goal:** 在不修改业务代码、不执行运行时验收的前提下，物化可恢复、可审查的 P0 整改启动包 v1.0，并在首个 P0 根因簇实现前停止。

**Architecture:** 以关闭的 `D:\tiku-readonly-audit` 为只读事实源，以 `D:\tiku` 当前 Git 基线为待整改源；审计原始 finding 永不改写，整改状态在源仓库独立 ledger 中关联。启动包按“基线恢复 → 35 个 P0 规范化 → 根因簇与依赖 → 验收契约 → WIP=1 → 对抗式验证”组织。

**Tech Stack:** Git/PowerShell、YAML、Markdown、现有 Tiku 治理脚本；不新增依赖，不连接数据库，不调用 Provider，不启动应用运行时。

## Global Constraints

- 任务范围仅限“P0 整改启动包 v1.0”；不得进入任何 P0 业务实现。
- `D:\tiku-readonly-audit` 完全只读；不修改、追加或重写 finding。
- `D:\tiku` 只允许本计划、启动包、独立 finding ledger 和 evidence 四个新增治理文档；`project-state.yaml`、`task-queue.yaml`、`src/**`、`tests/**`、`e2e/**`、schema、migration、依赖和外部配置全部禁止改动。
- 分支固定为 `codex/p0-remediation-startup-v1`，worktree 固定为 `D:\tiku\.worktrees\p0-remediation-startup-v1`。
- 不 push、不创建 PR、不部署、不执行 21 项运行时验收。
- P1/P2 只做影响映射，不做全量复验或修复。
- WIP=1，只推荐一个首要根因簇。
- 证据中不得出现凭据、Cookie、Token、Authorization、环境变量值、原始数据库行、Provider payload、Prompt、AI 原始输入输出、完整题目/材料/chunk 或明文 `redeem_code`。

## 已读取规范与基线

- `D:\tiku\AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md` 至 `adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/01-requirements/modules/01-user-auth.md` 至 `06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md` 至 `08-organization-ai-generation.md`
- `docs/01-requirements/stories/` 与 `docs/01-requirements/advanced-edition/stories/` 中相关 story
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-organization-ai-post-actions-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ops-authorization-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`
- 用户指定的六项只读审计关键材料。

## SSOT Read List

- 治理与架构：`AGENTS.md`、品味十诫、ADR-001 至 ADR-007、状态、队列、需求 SSOT 读取治理 SOP。
- 稳定需求：六个标准版 module、相关 story、八个高级版 module、相关高级版 story、edition-aware authorization 要求。
- 现行 traceability：2026-07-02 AI 基线与 role/auth/training/ops 决策、2026-07-05/06 AI closed-loop/recontract、2026-07-08 knowledge/resource/AI closure、2026-07-13 content-admin P0 contract。
- 当前验收基线：2026-07-02 AI acceptance-baseline normalization 与 goal-completion audit。
- 审计证据：用户指定的 synthesis、reconciliation、finding register、runtime backlog、runtime sequencing、completion audit。

## Requirement Decision Map

| 决策域                     | 当前权威结论                                                                                     | 本任务用法                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| 身份/session               | 前后台账号域隔离；后台失败锁定与学员失败锁定分别原子化；停用/重置撤销相应 session                | RC-01 根因与验收边界                        |
| authorization/organization | `effectiveEdition` 由 ADR-007 规则计算；organization 范围、额度和员工生命周期必须服务端原子约束  | RC-02、RC-03 根因与顺序                     |
| 内容/paper                 | question/material/paper 需共享语义校验、快照与发布不变量                                         | RC-04 根因与验收边界                        |
| RAG                        | `resource`、`chunk`、`embedding`、knowledge 关系和 `evidence_status` 必须由持久化事实支撑        | RC-05 根因与验收边界                        |
| AI                         | 旧 20 类仅在新鲜当前基线失败证据下重开；AI 组卷为方案+本地正式题选择；Provider/secret 仍 blocked | RC-06 仅登记审计已证实的新 P0，不重开旧残留 |
| 作答/训练                  | 正式答题、个人 AI 训练、organization training 属不同域；发布/答题/统计需各自持久化闭环           | RC-07、RC-08 根因与验收边界                 |

## Requirement Mapping

- RC-01 → user-auth、admin-ops、PIC-01/04/07。
- RC-02/RC-03 → advanced authorization context、ops authorization/quota、organization training、ADR-007。
- RC-04 → question-paper、content-admin P0 data-integrity contract。
- RC-05 → rag-knowledge、knowledge-node/resource AI closure plan。
- RC-06 → AI scoring、AI task domain、AI generation recontract/current baseline。
- RC-07 → student experience、AI scoring、formal/AI-training domain separation。
- RC-08 → organization training、organization AI post-actions、organization analytics。

## Evidence-Only Sources

- `D:\tiku-readonly-audit\**` 仅证明审计时的静态事实、finding 关联和待批准 runtime 入口，不作为需求 SSOT，也不被修改。
- `docs/05-execution-logs/evidence/**` 仅证明历史门禁/验收结果；需求含义以稳定需求、ADR 和更新 traceability 为准。
- 当前源代码仅用于复验实现现状，不反向定义业务需求。

## Conflict Check

- 当前源 HEAD 与审计源基线相同，无需重基线任何 P0；若后续 HEAD 变化，只按变更文件映射复验受影响 finding。
- 状态/队列仍是已关闭 content-admin program 的受保护终态；恢复 smoke 会拒绝未知顶层任务。故本任务不篡改 state/queue，以计划、主包、ledger、evidence 四文件恢复，避免把治理文档任务伪装成已关闭产品任务。
- 2026-07-02 AI goal-completion/current baseline 优先于旧 blocked/gap 残留；本任务只登记 finding register 中已有新鲜 P0 证据，不自行重开被 supersede 的旧问题。
- 审计结论与稳定需求未发现无法由时间序/来源层级消解的冲突；若实现阶段出现 schema、依赖、Provider、Cost Calibration 或产品语义冲突，必须另行停止并申请批准。

## 文件职责

- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-startup-package-v1.md`：人类可读的基线、根因簇、依赖图、P1/P2 影响、验收契约和 WIP=1 主包。
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-finding-ledger-v1.yaml`：全部且仅 35 个 P0 的机器可核验规范化总表。
- `docs/05-execution-logs/evidence/2026-07-14-p0-remediation-startup-package-v1.md`：命令、计数、完整性哈希、一致性检查和恢复演练证据。
- `docs/04-agent-system/state/project-state.yaml` 与 `docs/04-agent-system/state/task-queue.yaml`：只读校准，证明既有 program 已关闭且无相冲突的 active pending 工作；不修改。

---

### Task 1: 恢复双仓库事实基线

**Files:**

- Read: `D:\tiku\*`
- Read only: `D:\tiku-readonly-audit\*`
- Record: `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-startup-package-v1.md`

**Interfaces:**

- Consumes: 审计源提交 `7aac83765ca4b650b73b1612013e26a0111775ae`、审计仓提交 `a84224fa12ec85b28e6acd945deba2afa28c6c02`。
- Produces: 当前 HEAD/分支/status/远端/worktree/哈希，以及源基线后文件变更到 P0 的影响映射。

- [x] **Step 1: 读取状态队列、品味十诫和全部 ADR**
- [x] **Step 2: 获取源仓库本地、origin 跟踪分支和远端 `master` 的 SHA**
- [x] **Step 3: 获取审计仓库状态、tree SHA、关键文件 SHA-256 和 `git fsck` 结果**
- [x] **Step 4: 比较源 HEAD 与静态审计基线并确认受影响文件集合**

### Task 2: 规范化 35 个 P0

**Files:**

- Read only: `D:\tiku-readonly-audit\findings\finding-register.yaml`
- Read only: 用户指定的 reports/runtime/catalog 材料
- Create: `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-finding-ledger-v1.yaml`

**Interfaces:**

- Consumes: 178 项 finding SSOT、29 项横向能力、31 个状态机、59 个跨角色依赖、21 项 runtime validation。
- Produces: 35 个唯一 P0 行；每行含证据、角色/用例/链路、能力、状态机、依赖、代码定位、不变量、风险、复验分类、根因簇、P1/P2 影响和验证入口。

- [x] **Step 1: 从 register 严格筛选 `riskLevel=P0` 并校验数量为 35**
- [x] **Step 2: 保留原始证据字段，建立独立整改复验字段**
- [x] **Step 3: 关联横向能力、状态机、跨角色依赖和 runtime validation**
- [x] **Step 4: 逐项写入根因、不变量、风险和代码入口**

### Task 3: 建立根因簇、依赖顺序和 P1/P2 影响映射

**Files:**

- Create: `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-startup-package-v1.md`
- Modify: `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-finding-ledger-v1.yaml`

**Interfaces:**

- Consumes: 35 项 P0 ledger 与 143 项 P1/P2 标识、证据和代码定位。
- Produces: 无循环或循环已解释的根因簇 DAG、P1/P2 四分类影响映射、唯一首要根因簇。

- [x] **Step 1: 按共享不变量和权威写路径划分最少内聚根因簇**
- [x] **Step 2: 为每簇记录反证、上下游、爆炸半径、兼容/安全风险和最小修复边界**
- [x] **Step 3: 按身份/租户/数据损坏/事务状态机/共享基础能力确定 DAG**
- [x] **Step 4: P1/P2 仅标记 covered/semantic-change/revalidate-later/unrelated，不改原 finding 状态**

### Task 4: 编写每簇验收契约与 WIP=1 队列

**Files:**

- Modify: `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-startup-package-v1.md`

**Interfaces:**

- Consumes: 根因簇 DAG、runtime validation backlog、需求 SSOT 和 ADR。
- Produces: 正常/越权/非法状态/并发/中途失败/重试回滚/null 边界/字段枚举/API/角色回归/测试层级/runtime ID 合同。

- [x] **Step 1: 为每个根因簇完整列出验收维度**
- [x] **Step 2: 选出且仅选出一个首要根因簇**
- [x] **Step 3: 记录首簇纳入/排除范围、代码模块、必读需求与审批门禁**

### Task 5: 冻结恢复边界

**Files:**

- Read only: `docs/04-agent-system/state/project-state.yaml`
- Read only: `docs/04-agent-system/state/task-queue.yaml`
- Create: 本计划、主包、ledger、evidence 四个治理文件

**Interfaces:**

- Consumes: 已关闭 content-admin program 的不可改写历史、现有恢复 smoke 的严格 schema、四文件互引。
- Produces: 无需篡改既有 state/queue 的 docs-only 恢复入口；业务源码、依赖、数据库、Provider、runtime、PR/push/deploy 均 blocked。

- [x] **Step 1: 证明 state/queue 已关闭且无 active pending 冲突，不重开 F5**
- [x] **Step 2: 四个物化文件互引，并在 evidence 固化绝对路径与哈希**
- [x] **Step 3: next task 只在主包记录推荐候选，不激活首个业务修复簇**

### Task 6: 对抗式一致性检查与恢复演练

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-07-14-p0-remediation-startup-package-v1.md`
- Verify: 本计划声明的全部文件

**Interfaces:**

- Consumes: 完整启动包、双仓库前置哈希和 Git 状态。
- Produces: 可复跑命令及输出摘要；只允许在 fresh evidence 后声明启动包完成。

- [x] **Step 1: 机器校验 P0 恰为 35、ID 唯一、根因簇和验收契约全覆盖**
- [x] **Step 2: 校验 P1/P2 只有影响映射且无原 finding 状态改写**
- [x] **Step 3: 对 DAG 做拓扑排序并检查唯一 WIP 首项**
- [x] **Step 4: 从只读 state/queue 加四个物化文件冷恢复并重算关键计数**
- [x] **Step 5: 比较 audit tree/hash/status，证明审计仓库未改动**
- [x] **Step 6: 比较分支 diff allowlist，证明业务代码、依赖和配置未改动**
- [x] **Step 7: 运行 scoped format、`git diff --check` 与适用治理 smoke**

## 风险防御

- **错误重基线：** 当前 HEAD 若等于审计源提交，则全部 P0 沿用静态证据；只有发现文件变化才逐文件映射受影响项。
- **错误合并：** 根因共因只记录 `rootCauseClusterId`/关系，不改变原 finding 独立性，也不自动标记 duplicate/resolved。
- **旧 AI 残留重开：** 先使用 2026-07-02/05/06 现行 SSOT 与 goal-completion/baseline normalization；没有当前失败证据不重开已关闭的旧 20 类问题。
- **越权整改 P1/P2：** 本任务不修改任何 P1/P2 复验状态，只生成影响映射。
- **治理状态冲突：** 保留已关闭 content-admin program 历史；不向受恢复脚本保护的 state/queue 注入未知任务，部署和远端动作保持 blocked。
- **敏感证据泄漏：** 只记录 ID、文件/符号、计数和脱敏摘要，不复制敏感业务载荷。
- **恢复失败：** 只读 state/queue 与 plan、package、ledger、evidence 互相校准；恢复演练不得依赖当前会话记忆。
