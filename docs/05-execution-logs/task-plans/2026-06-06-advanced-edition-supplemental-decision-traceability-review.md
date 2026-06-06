# Advanced Edition Supplemental Decision Traceability Review

## Scope

本任务对 Phase 30 高级版需求补充决策做一轮自检和追溯整理，确保本轮已确认的产品决策完整、正确、详尽地汇总到原设计源、MVP 验收源和 evidence。

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- 本分支新增的 `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-*-decision.md`
- 本分支新增的 `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-*-decision.md`

## Self-Check Result Before Edits

只读自检确认：

- 本轮 12 个补充决策均已有对应 task plan 和 evidence。
- 本轮补充决策已分别落到原设计记录、MVP 验收源或 ops config contract。
- 当前剩余 `To be confirmed before implementation` 项集中在额度点数、AI 行为消耗点数、并发阈值、任务超时阈值和高峰阈值，属于 `Cost Calibration Gate` 或承载评估范围，本任务不推进。
- 未发现需要重新决策的非成本产品问题。

## Planned Work

1. 新增 Phase 30 补充决策索引和追溯审查文档。
2. 更新 MVP 的 `Traceability To Existing Decisions`，把本轮补充决策映射到原设计源、验收位置和 evidence。
3. 做角色/数据可见性一致性审查，重点覆盖企业管理员、企业员工、平台运营管理员、平台内容老师。
4. 补强 MVP 验收场景中的负向断言，覆盖发布后不可编辑、单次提交、下架后只看摘要、不可导出、不可看逐题明细、不可看单个 AI 任务详情等规则。

## Non-Goals

- 不写产品代码、数据库 schema、API、服务、UI、worker、测试代码或迁移。
- 不推进 provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。
- 不修改额度点数、AI 行为消耗点数、并发阈值、高峰阈值或任务超时阈值。
- 不新增尚未确认的产品结论。

## Validation

- `git diff --check`
- Prettier check for changed Markdown files.
- 文本检索确认禁用授权术语和非项目 `paper` 术语未引入。
- 文本检索确认补充决策索引、traceability、角色可见性审查和验收断言已写入。
