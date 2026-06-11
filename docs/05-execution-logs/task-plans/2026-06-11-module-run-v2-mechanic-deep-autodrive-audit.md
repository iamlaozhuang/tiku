# 2026-06-11 Module Run V2 机制二次深入审计计划

## 任务目标

对现有 Module Run V2 / Codex Automation 自动推进机制做二次深入审计，重点复核用户反馈的六类问题：不必要断点、过度谨慎与噪声、停下原因和下一步不清晰、停下收口不足、无任务时缺少自动拆解、拆解缺少 MECE 复核。

本轮唯一交付物是把新增审计发现追加到既有审计报告 `docs/05-execution-logs/audits-reviews/2026-06-11-module-run-v2-mechanic-autodrive-system-audit.md`，并补充本次只读证据。

## 范围边界

- 只做审计、证据记录和报告更新。
- 不实施机制修复，不修改 runner、SOP、schema、state 或 task queue 行为。
- 不创建 seed transaction，不运行 `New-ModuleRunV2ImplementationSeed.ps1 -Apply`。
- 不修改 `docs/04-agent-system/state/task-queue.yaml`。
- 不执行 push、deploy、provider、env/secret、schema migration、dependency/package/lockfile、Cost Calibration Gate。

## 已挂载规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## 审计步骤

1. 采集当前基线：分支、提交、工作区、Codex automation 注册、next action、PlanOnly runner、stopped automation hygiene。
2. 审计 `Invoke-ModuleRunV2AutopilotRunner.ps1` 中的 `Get-RunnerStopTaxonomy` 和 terminal decision，输出真实 `hard_block` / `approval_required` / `auto_recoverable` / `idle` / `advisory` 映射。
3. 审计 `Get-TikuNextAction.ps1` 的 `legacy_done`、`evidenceMissing`、blocked gates 输出，区分默认摘要、verbose 展开、hard-block 展开。
4. 审计 run registry finalizer、startup readiness、stopped hygiene、handoff SOP，检查停止原因、风险、下一步命令、state written/no-write reason、resume pointer。
5. 审计 auto-seed proposal、seed transaction、seed self-review 与 `standingUnattendedLocalCloseoutApproval` 的消费路径。
6. 对照 requirement/task coverage SOP 和 domain module matrix，复核 `ai-task-and-provider` 四个 target closure 的 MECE 证明缺口。

## 验证计划

- `git diff --check`
- Targeted Prettier check：本轮 task plan、本轮 evidence、既有审计报告。
- Targeted anchor check 覆盖：
  - `seed_proposal_available`
  - `hard_block`
  - `approval_required`
  - `auto_recoverable`
  - `standingUnattendedLocalCloseoutApproval`
  - `MECE`
  - `finalizer`
  - `nextCommand`
  - `Cost Calibration Gate remains blocked`

## 风险与防御

- 风险：把审计建议误实施为 runner 行为变更。
  - 防御：本轮只改审计报告、evidence、task plan。
- 风险：为了验证 auto-seed 能力误写 `task-queue.yaml`。
  - 防御：只运行 PlanOnly runner，不运行 seed apply。
- 风险：状态源过多导致报告再次引入漂移。
  - 防御：在报告中区分唯一事实源、派生摘要和建议性输出。
