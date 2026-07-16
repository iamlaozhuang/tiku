# P1/P2 整改启动包 v1.0 执行方案

> **执行要求：** 使用既定计划逐步执行；未经用户批准禁止 Subagent。本任务仅做治理文档、静态一级复检与恢复验证。

**Goal：** 在不进入 P1/P2 产品实现的前提下，对 125 个 P1、18 个 P2 共 143 个 finding 完成唯一登记、一级复检、候选根因归并、依赖与验收编排，并物化可恢复的启动包。

**Architecture：** 只读审计仓保持原始 finding SSOT；当前源仓物化独立 ledger、post-P0 revalidation map、候选根因簇、serial-program 草案与 state/queue 投影。一级复检只确认当前锚点和 P0 影响，深度对抗复检延迟到根因簇领取时即时完成。

**Tech Stack：** Git、PowerShell、YAML、Markdown、现有 Module Run v2/v3 治理脚本；不新增依赖。

## Global Constraints

- 基线：source/master/origin/live `0643ad4d6346453f3324d86b6e003c6726c808ef`；P0 产品静态基线 `e136ca28acde82282a17c65ccfb828a01e872c0b`；审计仓 `a84224fa12ec85b28e6acd945deba2afa28c6c02`。
- `D:\tiku-readonly-audit` 只读，禁止修改原始 finding、runtime backlog 和审计结论。
- 143 个 finding 必须全部且仅登记一次；P1=125、P2=18；原始风险等级与 finding 身份永久保留。
- 复检证据状态、处置结论、执行状态三维独立，禁止由 `potentiallyCovered` 推导已修复。
- P1 只形成候选根因簇和 WIP=1 首任务选择规则；P2 在 P1 冻结前仅做影响映射。
- 不修改产品源码、产品测试、schema/migration、依赖、lockfile、数据库、Provider、secret/env、浏览器/runtime 或外部配置。
- 不执行 21 项 runtime validation，不创建 PR、不 force push、不部署。
- 所有编辑在 `codex/p1-p2-remediation-startup-package-v1` / `D:\tiku\.worktrees\p1-p2-remediation-startup-package-v1` 隔离进行。

---

## Files

- Create: `docs/05-execution-logs/evidence/2026-07-15-p1-p2-remediation-startup-package-v1.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-startup-package-v1.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml`
- Create: `docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml`
- Create: `docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml`
- Create: `docs/05-execution-logs/task-plans/2026-07-15-p1-remediation-serial-program.md`
- Create: `scripts/agent-system/New-P1P2RemediationStartupArtifacts.ps1`
- Create: `scripts/agent-system/Test-P1P2RemediationStartupPackage.ps1`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

## Task 1: Baseline Recovery

- [x] 读取 `AGENTS.md`、品味十诫、ADR-001 至 ADR-007、requirements 根索引、高级版索引和 edition-aware authorization SSOT。
- [x] 按 AI 基线恢复规则读取 2026-07-02 SSOT/phase4 alignment、goal-completion audit 和 acceptance-baseline normalization。
- [x] 验证 source/master/origin/live、worktree、审计仓 HEAD/clean/fsck 与六个关键 SHA-256。
- [x] 验证 `e136ca28a..HEAD` 的产品路径漂移为 0，并把 `7aac837..e136ca2` 的 P0 变化作为一级复检影响输入。
- [x] 读取 P0 frozen baseline、P1/P2 impact map、原 finding register、runtime backlog 和 sequencing。

## Task 2: 143-Item Level-One Revalidation

- [x] 从只读 finding register 解析 125 个 P1、18 个 P2 的原始标题、状态、角色、用例、能力、业务影响、根因假设、requirement/code/test 证据和 runtime ID。
- [x] 对每项核对当前 requirement/code/test 文件锚点是否存在，并计算 P0 是否修改原 code/test anchor 文件。
- [x] 关联现有 `potentiallyCovered/semanticChange/revalidateAfterP0/unrelatedDeferred`，生成三维状态和候选根因簇。
- [x] F-0013 强制保留 `runtime_evidence_required + runtime_hold + pending`。
- [x] 所有非 F-0013 项保持 `pending`，不在一级复检中宣告深度关闭。

## Task 3: Root-Cause Model And Serial Draft

- [x] 物化候选 P1/P2 根因簇、根因假设、反证、依赖、爆炸半径、兼容/安全风险、最小验证边界和审批边界。
- [x] 建立无环 DAG；按身份/租户/授权、共享 API 合同、内容、knowledge/RAG、AI、学员闭环、organization training 排序。
- [x] 为每簇写入正常、越权、非法状态、并发、失败回滚、幂等、边界输入、字段/枚举、API、角色回归和测试契约。
- [x] serial-program 仅为 P1 后续 Goal 草案；不在 state/queue 中创建任何可领取的 P1 实现任务。

## Task 4: State, Queue And Verification

- [x] 以 `currentTask.startupPackage` 和 queue `activeTasks` 物化独立逻辑启动 Program，服从 recovery-surface 瘦身门禁，不新增顶层键且不改写关闭的 P0 Program。
- [x] 当前唯一 WIP 为启动包；task allowlist 仅含本方案列出的 docs/governance/script 文件。
- [x] 实现机器校验：143 唯一、125/18 风险数量、三维状态、cluster 单归属、DAG 无环、21 runtime pending、F-0013 边界、产品零漂移、审计仓完整性、P2 无实现授权。
- [x] 运行 P0 global guard，证明启动包没有破坏 P0 frozen baseline。

## Task 5: Adversarial Review And Recovery

- [x] Round 1：攻击数量、唯一性、原证据血缘、当前锚点、P0 修改归因、错误闭合、降级、重复和根因误并。
- [x] Round 2：攻击九角色、31 状态机、59 跨角色依赖、P1/P2 顺序、runtime 边界、权限矩阵、恢复面和反向破坏。
- [x] 从已提交或可恢复提交创建 detached worktree，仅依靠 state/queue/plan/evidence/ledger/map/cluster/script 运行验证。
- [x] 确认源仓产品路径未改、审计仓未改、无依赖或外部配置变化。

## Validation Commands

- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P1P2RemediationStartupPackage.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.ps1 -Phase manual`
- `D:/tiku/node_modules/.bin/prettier.cmd --check <human-authored startup files>`；生成 YAML 使用 deterministic generator + independent parser gate
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-p2-remediation-startup-package-v1-2026-07-15`

## Completion Boundary

- 启动包物化、143 项一级复检唯一完整、候选簇/DAG/验收契约/审批矩阵完成、一致性与恢复演练通过。
- 不以本 Goal 建立 P1/P2 产品修复结论；后续深度复检和实现必须新建并批准 P1 串行整改 Goal。
- 当前 Goal 不包含 merge/push 授权；若完成本地可审查提交后缺少 closeout 授权，保持真实审批边界并停止。
