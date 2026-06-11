# 2026-06-11 机制自动推进系统审计计划

## 任务目标

对题库系统当前“模块推进 / Module Run V2 / Codex Automation 自动驾驶”机制做一次系统化审计，聚焦用户反馈的断点、过度谨慎、状态漂移、停下收口、无任务自动拆解、MECE 拆解复核六类问题，输出可落地的优化建议与优先级路线图。

## 范围

- 只审计机制设计、SOP、状态源、脚本决策输出、运行证据与任务拆解流程。
- 本次不修改业务代码、不改数据库、不改依赖、不提交、不 push。
- 可新增审计计划、审计报告、证据记录等文档。
- 当前工作区存在上一项 `codex automation UI visibility / automation registration repair` 的未提交改动，本次审计只基于其现状读取和引用，不回滚、不混入实现性代码修改。

## 已挂载规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## 审计方法

1. 采集当前推进状态、队列状态、自动化注册状态、runner plan-only 决策与仓库姿态。
2. 复核机制核心文档和脚本的决策边界，区分安全硬阻断、可自动恢复、可继续但需记录、需要人工产品决策四类场景。
3. 对状态源进行源头映射，识别重复记录、漂移风险、写入职责不清和收口遗漏。
4. 对无任务场景下的自动拆解机制进行审计，重点检查 seed proposal、任务领取、依赖闭包和审批边界。
5. 建立 MECE 拆解复核框架，覆盖需求到任务、任务到验收、模块到端到端流程的完整链路。
6. 输出按优先级分层的优化路线图，明确哪些是立即可改的机制修复，哪些需要用户确认治理口径。

## 验证计划

- 运行只读诊断脚本并记录关键输出。
- 对新增 Markdown 文档运行 `git diff --check`。
- 若本地格式化工具可用，对新增 Markdown 文件做 targeted check；不可用时在 evidence 中说明。

## 风险与防御

- 风险：把上一项未提交 automation 修复误当成本次审计改动。
  - 防御：在 evidence 中记录审计前 `git status`，本次新增文档单独列示。
- 风险：为了“优化机制”直接改脚本导致影响当前推进系统。
  - 防御：本次仅出审计和方案，不实施机制代码变更。
- 风险：审计建议过于抽象。
  - 防御：每个建议绑定触发场景、目标状态、落地动作和优先级。
