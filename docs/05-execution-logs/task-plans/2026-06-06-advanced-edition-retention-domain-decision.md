# Advanced Edition Retention Domain Decision

## Scope

本任务只维护高级版 MVP 需求设计中的产品决策记录，记录“生成内容保留期按内容域拆分治理”的已确认决策。

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`

## Confirmed Input

用户确认采用方案 1：生成内容保留期按内容域拆分治理。

## Non-Goals

- 不写产品代码、数据库 schema、API、服务、UI、worker、测试代码或迁移。
- 不推进 provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。
- 不确认额度点数、AI 行为消耗点数、并发阈值、高峰阈值、任务超时阈值或 provider 成本假设。
- 不把未确认的到期隐藏宽限期、`audit_log` 保留期或 `ai_call_log` 保留期写成既定结论。

## Implementation Notes

- 在运营配置 contract 中替换单一 `generated_content_retention_day` 口径，改为内容域级保留策略。
- 保留已定稿来源：个人/员工 AI 学习型生成内容 90 天；企业训练未发布草稿 90 天；已发布企业训练长期保留；正式 `question` / `paper` 草稿按现有内容管理规则。
- 增加明确说明：本决策不依赖 `Cost Calibration Gate`，但生产启用仍需配置版本、审计和脱敏规则。

## Validation

- `git diff --check`
- Prettier check for changed Markdown files.
- 文本检索确认禁用授权术语和非项目 `paper` 术语未引入。
