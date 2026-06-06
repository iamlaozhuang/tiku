# Advanced Edition Requirements Freeze And Implementation Prep

## Scope

本任务执行 Phase 30 高级版首期需求冻结审查与实现拆解准备，目标是确认当前高级版首期需求是否可以作为后续实现任务的 source of truth，并把后续工程拆解为可领取、可验证、可保持边界的任务组。

本任务是 docs-only 工作，不写产品代码、数据库 schema、API、UI、worker、测试代码或迁移。

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-06-06-advanced-edition-supplemental-decision-traceability-review.md`

## Planned Work

1. 新增需求冻结审查报告，确认高级版首期主需求、角色边界、验收断言、配置合同和 blocked gate 状态。
2. 新增实现拆解准备计划，按后续可独立实现的任务组拆分数据域、服务域、界面流、验收门禁和显式禁止项。
3. 更新 MVP 主规格，增加需求冻结交接入口和后续实现拆解引用。
4. 新增 evidence，记录审查结论、变更文档和验证命令。

## Freeze Criteria

需求冻结审查至少覆盖：

- 主闭环是否覆盖个人 AI 出题/组卷、企业管理员创建企业训练、员工作答统计、运营后台 `authorization` / 额度管理。
- 已确认决策是否均可追溯到原设计、MVP 主规格、ops config contract 或 evidence。
- 未确认事项是否仍停留在 `Cost Calibration Gate` 或实现前配置决策，不被写成既定结论。
- 后续实现任务是否能明确避开 provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付和外部服务动作。
- 项目术语是否继续使用 `authorization`、`paper`、`mock_exam`、`redeem_code` 等项目术语。

## Non-Goals

- 不推进 `Cost Calibration Gate`。
- 不确认额度包初始点数、AI 行为消耗点数、并发阈值、超时阈值、高峰阈值或 provider 成本假设。
- 不创建或修改 env/secret、staging/prod/cloud/deploy、支付或外部服务配置。
- 不新增依赖、不修改 package 或 lockfile。
- 不修改数据库 schema、迁移、接口实现、服务实现、UI 或测试代码。

## Validation

- `git diff --check`
- Prettier check for changed Markdown files.
- 文本检索确认需求冻结审查、实现拆解准备、blocked gate 边界和 MVP 交接入口已写入。
- 文本检索确认本次变更未引入禁用授权英文词或非项目 `paper` 词。
